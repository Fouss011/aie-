import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { importActivities, importCharges } from "../api/importsApi";

const MODULE_OPTIONS = [
  { value: "activities", label: "Activités" },
  { value: "charges", label: "Charges" },
];

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");
}

function isEmptyValue(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function isNumericLike(value) {
  if (value === null || value === undefined || value === "") return false;
  const cleaned = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/\u00a0/g, "")
    .replace(",", ".");
  if (cleaned === "") return false;
  return !Number.isNaN(Number(cleaned));
}

function parseAmount(value) {
  if (value === null || value === undefined || value === "") return "";
  const cleaned = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/\u00a0/g, "")
    .replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : "";
}

function parseExcelDate(value) {
  if (value === null || value === undefined || value === "") return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const yyyy = parsed.y;
      const mm = String(parsed.m).padStart(2, "0");
      const dd = String(parsed.d).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [dd, mm, yyyy] = text.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  return text;
}

function guessField(header, moduleType) {
  const h = normalizeHeader(header);

  if (!h) return "";

  if (moduleType === "activities") {
    if (
      h.includes("activite") ||
      h.includes("libelle") ||
      h.includes("label") ||
      h.includes("produit") ||
      h.includes("service") ||
      h.includes("designation") ||
      h.includes("désignation") ||
      h.includes("article") ||
      h.includes("nom")
    ) {
      return "label";
    }

    if (
      h.includes("montant") ||
      h.includes("prix") ||
      h.includes("amount") ||
      h.includes("total") ||
      h.includes("entree") ||
      h.includes("entrée") ||
      h.includes("vente") ||
      h.includes("recette") ||
      h.includes("revenu") ||
      h.includes("ca") ||
      h.includes("chiffre")
    ) {
      return "amount";
    }

    if (
      h.includes("client") ||
      h.includes("contact") ||
      h.includes("reference") ||
      h.includes("référence") ||
      h.includes("ref") ||
      h.includes("telephone") ||
      h.includes("téléphone") ||
      h.includes("tel")
    ) {
      return "contact";
    }

    if (h.includes("date") || h.includes("jour")) {
      return "date";
    }
  }

  if (moduleType === "charges") {
    if (
      h.includes("libelle") ||
      h.includes("label") ||
      h.includes("depense") ||
      h.includes("dépense") ||
      h.includes("motif") ||
      h.includes("designation") ||
      h.includes("désignation") ||
      h.includes("article") ||
      h.includes("nom")
    ) {
      return "label";
    }

    if (
      h.includes("montant") ||
      h.includes("prix") ||
      h.includes("amount") ||
      h.includes("total") ||
      h.includes("achat") ||
      h.includes("stock") ||
      h.includes("cout") ||
      h.includes("coût") ||
      h.includes("frais") ||
      h.includes("sortie")
    ) {
      return "amount";
    }

    if (
      h.includes("categorie") ||
      h.includes("catégorie") ||
      h.includes("type") ||
      h.includes("famille")
    ) {
      return "category";
    }

    if (h.includes("date") || h.includes("jour")) {
      return "date";
    }
  }

  return "";
}

function buildRowsFromMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return [];

  const nonEmptyRows = matrix.filter((row) =>
    Array.isArray(row) ? row.some((cell) => !isEmptyValue(cell)) : false
  );

  if (!nonEmptyRows.length) return [];

  let headerIndex = 0;
  let bestScore = -1;

  nonEmptyRows.forEach((row, index) => {
    const filledCount = row.filter((cell) => !isEmptyValue(cell)).length;
    const textCount = row.filter(
      (cell) => !isEmptyValue(cell) && !isNumericLike(cell)
    ).length;
    const score = filledCount + textCount * 2;

    if (score > bestScore) {
      bestScore = score;
      headerIndex = index;
    }
  });

  const headerRow = nonEmptyRows[headerIndex] || [];
  const maxLength = Math.max(
    ...nonEmptyRows.map((row) => (Array.isArray(row) ? row.length : 0)),
    0
  );

  const headers = Array.from({ length: maxLength }, (_, index) => {
    const raw = headerRow[index];
    const text = String(raw || "").trim();
    return text || `col_${index + 1}`;
  });

  const dataRows = nonEmptyRows.slice(headerIndex + 1);

  return dataRows
    .map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row?.[index] ?? "";
      });
      return obj;
    })
    .filter((row) =>
      Object.values(row).some((value) => !isEmptyValue(value))
    );
}

function autoDetectMap(columns, rows, moduleType) {
  const detectedMap = {};
  const usedTargets = new Set();

  columns.forEach((column) => {
    const detected = guessField(column, moduleType);
    if (detected && !usedTargets.has(detected)) {
      detectedMap[column] = detected;
      usedTargets.add(detected);
    } else {
      detectedMap[column] = "";
    }
  });

  const sampleRows = rows.slice(0, 20);

  const columnStats = columns.map((column) => {
    const values = sampleRows.map((row) => row[column]);
    const nonEmpty = values.filter((value) => !isEmptyValue(value));
    const numericCount = nonEmpty.filter(isNumericLike).length;
    const textCount = nonEmpty.filter((value) => !isNumericLike(value)).length;
    const dateLikeCount = nonEmpty.filter((value) => {
      const text = String(value || "").trim();
      return (
        /^\d{2}\/\d{2}\/\d{4}$/.test(text) ||
        /^\d{4}-\d{2}-\d{2}$/.test(text)
      );
    }).length;

    return {
      column,
      nonEmptyCount: nonEmpty.length,
      numericCount,
      textCount,
      dateLikeCount,
    };
  });

  const assignFirstAvailable = (target, predicate) => {
    if (usedTargets.has(target)) return;

    const found = columnStats.find(
      (stat) => !usedTargets.has(target) && predicate(stat)
    );

    if (found) {
      detectedMap[found.column] = target;
      usedTargets.add(target);
    }
  };

  assignFirstAvailable(
    "label",
    (stat) =>
      stat.textCount > 0 &&
      stat.textCount >= stat.numericCount &&
      normalizeHeader(stat.column) !== ""
  );

  assignFirstAvailable(
    "amount",
    (stat) =>
      stat.numericCount > 0 &&
      stat.numericCount >= stat.textCount &&
      !normalizeHeader(stat.column).includes("date")
  );

  if (moduleType === "activities") {
    assignFirstAvailable(
      "contact",
      (stat) =>
        normalizeHeader(stat.column).includes("contact") ||
        normalizeHeader(stat.column).includes("client") ||
        normalizeHeader(stat.column).includes("ref")
    );
  } else {
    assignFirstAvailable(
      "category",
      (stat) =>
        normalizeHeader(stat.column).includes("categorie") ||
        normalizeHeader(stat.column).includes("catégorie") ||
        normalizeHeader(stat.column).includes("type")
    );
  }

  assignFirstAvailable("date", (stat) => stat.dateLikeCount > 0);

  return detectedMap;
}

function normalizeRows(rows, map, moduleType) {
  return rows.map((row) => {
    const result = {};

    Object.entries(map).forEach(([source, target]) => {
      if (!target) return;

      let value = row[source];

      if (target === "amount") {
        value = parseAmount(value);
      }

      if (target === "date") {
        value = parseExcelDate(value);
      }

      result[target] = value ?? "";
    });

    if (moduleType === "activities") {
      return {
        label: result.label || "",
        amount: result.amount ?? "",
        contact: result.contact || "",
        date: result.date || "",
      };
    }

    return {
      label: result.label || "",
      amount: result.amount ?? "",
      category: result.category || "",
      date: result.date || "",
    };
  });
}

export default function ImportsPage() {
  const [moduleType, setModuleType] = useState("activities");
  const [rawRows, setRawRows] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [columnMap, setColumnMap] = useState({});
  const [unknownColumns, setUnknownColumns] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const requiredFields = useMemo(() => ["label", "amount"], []);

  const availableFields = useMemo(() => {
    if (moduleType === "activities") {
      return [
        { value: "label", label: "Activité / Libellé" },
        { value: "amount", label: "Montant" },
        { value: "contact", label: "Contact / Référence" },
        { value: "date", label: "Date" },
      ];
    }

    return [
      { value: "label", label: "Libellé" },
      { value: "amount", label: "Montant" },
      { value: "category", label: "Catégorie" },
      { value: "date", label: "Date" },
    ];
  }, [moduleType]);

  async function readFile(file) {
    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith(".csv")) {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: false,
          skipEmptyLines: true,
          complete(results) {
            const matrix = results.data || [];
            const rows = buildRowsFromMatrix(matrix);
            resolve(rows);
          },
          error() {
            reject(new Error("Impossible de lire le fichier CSV."));
          },
        });
      });
    }

    if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
        defval: "",
        raw: false,
      });

      return buildRowsFromMatrix(matrix);
    }

    throw new Error("Format non supporté. Utilise un CSV ou un fichier Excel.");
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      setSuccess("");
      setFileName(file.name);

      const rows = await readFile(file);

      if (!rows.length) {
        throw new Error("Le fichier ne contient aucune donnée exploitable.");
      }

      const columns = Object.keys(rows[0] || {});
      const detectedMap = autoDetectMap(columns, rows, moduleType);
      const unknown = columns.filter((column) => !detectedMap[column]);

      const normalized = normalizeRows(rows, detectedMap, moduleType);

      setRawRows(rows);
      setColumnMap(detectedMap);
      setUnknownColumns(unknown);
      setPreviewRows(normalized.slice(0, 8));

      const hasRequired = requiredFields.every((field) =>
        Object.values(detectedMap).includes(field)
      );

      if (!hasRequired) {
        setShowAdvanced(true);
        setError(
          "Certaines colonnes n'ont pas été reconnues automatiquement. Corrige-les ci-dessous."
        );
        return;
      }

      if (unknown.length > 0) {
        setShowAdvanced(true);
        setSuccess(
          "Fichier partiellement reconnu. Vérifie les colonnes puis importe."
        );
      } else {
        setShowAdvanced(false);
        setSuccess(
          "Fichier reconnu automatiquement. Tu peux importer directement."
        );
      }
    } catch (err) {
      setError(err.message || "Impossible de traiter le fichier.");
      setRawRows([]);
      setPreviewRows([]);
      setColumnMap({});
      setUnknownColumns([]);
      setShowAdvanced(false);
    }
  }

  function updateColumn(source, value) {
    const updated = {
      ...columnMap,
      [source]: value,
    };

    setColumnMap(updated);

    const normalized = normalizeRows(rawRows, updated, moduleType);
    setPreviewRows(normalized.slice(0, 8));
  }

  async function handleImport() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const rowsToSend = normalizeRows(rawRows, columnMap, moduleType).filter(
        (row) =>
          String(row.label || "").trim() !== "" &&
          row.amount !== "" &&
          row.amount !== null &&
          row.amount !== undefined
      );

      if (!rowsToSend.length) {
        throw new Error("Aucune ligne valide à importer.");
      }

      const response =
        moduleType === "activities"
          ? await importActivities(rowsToSend)
          : await importCharges(rowsToSend);

      setSuccess(
        response.message ||
          `Import terminé avec succès. Retrouve maintenant les éléments dans ${
            moduleType === "activities" ? "Activités" : "Charges"
          }.`
      );
    } catch (err) {
      setError(err.message || "Impossible d'importer les données.");
    } finally {
      setLoading(false);
    }
  }

  const previewHeaders =
    moduleType === "activities"
      ? ["label", "amount", "contact", "date"]
      : ["label", "amount", "category", "date"];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Importer un fichier
          </h1>
          <p className="mt-2 text-slate-500">
            Charge simplement un fichier CSV ou Excel. Le système essaie de
            reconnaître les colonnes automatiquement.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Où envoyer les données ?
            </label>

            <select
              value={moduleType}
              onChange={(e) => {
                setModuleType(e.target.value);
                setRawRows([]);
                setPreviewRows([]);
                setColumnMap({});
                setUnknownColumns([]);
                setShowAdvanced(false);
                setSuccess("");
                setError("");
                setFileName("");
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              {MODULE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Ton fichier
            </label>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFile}
              className="block w-full rounded-2xl border border-slate-200 px-4 py-3 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white"
            />
          </div>
        </div>

        {fileName && (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
            Fichier chargé : <strong>{fileName}</strong>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
      </section>

      {previewRows.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Aperçu avant import
              </h2>
              <p className="text-sm text-slate-500">
                Voici ce qui sera créé après import.
              </p>
            </div>

            {(unknownColumns.length > 0 ||
              !requiredFields.every((field) =>
                Object.values(columnMap).includes(field)
              )) && (
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {showAdvanced
                  ? "Masquer les réglages"
                  : "Corriger les colonnes"}
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-500">
                  {previewHeaders.map((key) => (
                    <th key={key} className="px-4 py-3 capitalize">
                      {key === "label"
                        ? "Libellé"
                        : key === "amount"
                        ? "Montant"
                        : key === "contact"
                        ? "Contact"
                        : key === "category"
                        ? "Catégorie"
                        : "Date"}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    {previewHeaders.map((key) => (
                      <td key={key} className="px-4 py-3 text-slate-700">
                        {row[key] !== "" && row[key] !== null && row[key] !== undefined
                          ? row[key]
                          : "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showAdvanced && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Corriger les colonnes
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {Object.keys(columnMap).map((column) => (
                  <div key={column}>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {column}
                    </label>

                    <select
                      value={columnMap[column] || ""}
                      onChange={(e) => updateColumn(column, e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      <option value="">Ignorer cette colonne</option>

                      {availableFields.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="rounded-2xl bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Import en cours..." : "Importer maintenant"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}