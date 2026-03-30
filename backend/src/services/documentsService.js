import { supabase } from "../config/supabaseClient.js";

const BUCKET_NAME = "aie-documents";

export async function uploadDocumentToStorage({
  buffer,
  originalName,
  mimeType,
}) {
  const safeName = originalName.replace(/\s+/g, "-");
  const filePath = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Erreur upload storage: ${uploadError.message}`);
  }

  const { data: publicData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: publicData?.publicUrl || null,
  };
}

export async function createDocumentRecord(payload) {
  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        label: payload.label || null,
        linked_to: payload.linkedTo || null,
        linked_kind: payload.linkedKind || null,
        file_name: payload.fileName,
        file_path: payload.filePath,
        file_type: payload.fileType || null,
        file_size: payload.fileSize || null,
        public_url: payload.publicUrl || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Erreur création document: ${error.message}`);
  }

  return data;
}

export async function listDocuments(limit = 100) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erreur lecture documents: ${error.message}`);
  }

  return data || [];
}

export async function removeDocument(id) {
  const { data: existing, error: readError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (readError) {
    throw new Error(`Document introuvable: ${readError.message}`);
  }

  if (existing?.file_path) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([existing.file_path]);

    if (storageError) {
      throw new Error(`Erreur suppression storage: ${storageError.message}`);
    }
  }

  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(`Erreur suppression document: ${deleteError.message}`);
  }

  return existing;
}