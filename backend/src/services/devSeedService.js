import { supabase } from "../config/supabaseClient.js";

function getDateOffset(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

const demoSales = [
  { product: "Huile moteur", amount: 15000, client_name: "Kossi", sale_date: new Date().toISOString().slice(0, 10) },
  { product: "Huile moteur", amount: 12000, client_name: "Ama", sale_date: new Date().toISOString().slice(0, 10) },
  { product: "Filtre à huile", amount: 8000, client_name: "Yao", sale_date: new Date().toISOString().slice(0, 10) },
  { product: "Liquide de frein", amount: 10000, client_name: null, sale_date: new Date().toISOString().slice(0, 10) },
  { product: "Huile moteur", amount: 18000, client_name: "Sena", sale_date: getDateOffset(-1) },
  { product: "Graisse industrielle", amount: 22000, client_name: "Komi", sale_date: getDateOffset(-1) },
  { product: "Filtre à air", amount: 9000, client_name: "Afi", sale_date: getDateOffset(-2) },
  { product: "Bougie", amount: 6000, client_name: "Mensah", sale_date: getDateOffset(-4) },
];

const demoExpenses = [
  { label: "Transport livraison", amount: 3000, category: "Logistique", expense_date: new Date().toISOString().slice(0, 10) },
  { label: "Internet bureau", amount: 5000, category: "Administration", expense_date: new Date().toISOString().slice(0, 10) },
  { label: "Carburant", amount: 7000, category: "Logistique", expense_date: new Date().toISOString().slice(0, 10) },
  { label: "Emballage", amount: 2500, category: "Exploitation", expense_date: new Date().toISOString().slice(0, 10) },
  { label: "Achat stock huile", amount: 20000, category: "Approvisionnement", expense_date: getDateOffset(-1) },
  { label: "Maintenance moto", amount: 12000, category: "Logistique", expense_date: getDateOffset(-2) },
  { label: "Loyer dépôt", amount: 30000, category: "Structure", expense_date: getDateOffset(-3) },
  { label: "Publicité Facebook", amount: 10000, category: "Marketing", expense_date: getDateOffset(-5) },
];

export async function resetAndSeedDemoData() {
  const deleteSales = await supabase.from("sales").delete().neq("id", 0);
  if (deleteSales.error) {
    throw new Error(`Erreur suppression ventes: ${deleteSales.error.message}`);
  }

  const deleteExpenses = await supabase.from("expenses").delete().neq("id", 0);
  if (deleteExpenses.error) {
    throw new Error(`Erreur suppression dépenses: ${deleteExpenses.error.message}`);
  }

  const insertSales = await supabase.from("sales").insert(demoSales).select();
  if (insertSales.error) {
    throw new Error(`Erreur insertion ventes démo: ${insertSales.error.message}`);
  }

  const insertExpenses = await supabase.from("expenses").insert(demoExpenses).select();
  if (insertExpenses.error) {
    throw new Error(`Erreur insertion dépenses démo: ${insertExpenses.error.message}`);
  }

  return {
    salesInserted: insertSales.data?.length || 0,
    expensesInserted: insertExpenses.data?.length || 0,
  };
}