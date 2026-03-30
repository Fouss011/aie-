function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/[’']/g, " ") // uniformise les apostrophes
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function detectIntent(question) {
  const q = normalizeText(question);

  if (!q) return "unknown";

  if (
    includesAny(q, [
      "combien jai vendu aujourdhui",
      "vente aujourdhui",
      "vendu aujourdhui",
    ])
  ) {
    return "sales_today";
  }

  if (
    includesAny(q, [
      "combien jai depense aujourdhui",
      "depense aujourdhui",
      "depense aujourd hui",
      "depensee aujourdhui",
      "depensee aujourd hui",
    ])
  ) {
    return "expenses_today";
  }

  if (
    includesAny(q, [
      "combien jai gagne aujourdhui",
      "gagne aujourdhui",
      "benefice aujourdhui",
      "profit aujourdhui",
      "resultat aujourdhui",
      "combien jai gagne aujourd hui",
      "benefice aujourd hui",
      "profit aujourd hui",
      "resultat aujourd hui",
    ])
  ) {
    return "profit_today";
  }

  if (
    includesAny(q, [
      "combien jai gagne ce mois",
      "benefice ce mois",
      "profit ce mois",
      "resultat du mois",
    ])
  ) {
    return "profit_month";
  }

  if (includesAny(q, ["ce mois", "mois ci", "vendu ce mois"])) {
    return "sales_month";
  }

  if (
    includesAny(q, [
      "combien jai vendu",
      "total des ventes",
      "chiffre daffaires",
      "vente totale",
      "montant total des ventes",
    ])
  ) {
    return "sales_total";
  }

  if (
    includesAny(q, [
      "combien jai depense",
      "total des depenses",
      "montant total des depenses",
    ])
  ) {
    return "expenses_total";
  }

  if (
    includesAny(q, [
      "produit le plus vendu",
      "produit marche le plus",
      "quel produit marche",
      "top produit",
      "meilleur produit",
    ])
  ) {
    return "top_product";
  }

  if (
    includesAny(q, [
      "plus grosse depense",
      "depense la plus elevee",
      "quelle depense pese le plus",
    ])
  ) {
    return "top_expense_label";
  }

  if (
    includesAny(q, [
      "categorie de depense la plus elevee",
      "categorie la plus depensee",
    ])
  ) {
    return "top_expense_category";
  }

  if (
    includesAny(q, [
      "derniere vente",
      "vente la plus recente",
    ])
  ) {
    return "latest_sale";
  }

  if (
    includesAny(q, [
      "derniere depense",
      "depense la plus recente",
    ])
  ) {
    return "latest_expense";
  }

  if (includesAny(q, ["sans client", "ventes sans client"])) {
    return "sales_without_client";
  }

  if (includesAny(q, ["combien de ventes", "nombre de ventes"])) {
    return "sales_count";
  }

  if (includesAny(q, ["combien de depenses", "nombre de depenses"])) {
    return "expenses_count";
  }

  return "fallback_ai";
}