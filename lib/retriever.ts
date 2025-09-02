// // lib/retriever.ts
// import OpenAI from "openai";
// import { createClient } from "@supabase/supabase-js";
// import { EvidenceSnippet } from "./types";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// export async function searchEvidence(
//   query: string,
//   matchCount = 5
// ): Promise<EvidenceSnippet[]> {
//   const embeddingRes = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: query,
//   });

//   const embedding = embeddingRes.data[0].embedding;

//   const { data, error } = await supabase.rpc("match_document_chunks", {
//     query_embedding: embedding,
//     match_count: matchCount,
//   });

//   if (error) throw error;

//   return (data || []).map((row: any) => ({
//     chunkId: row.id,
//     text: row.text,
//     source: row.metadata?.source || "Unknown",
//     page: row.metadata?.page,
//     charStart: row.char_start,
//     charEnd: row.char_end,
//     url: row.metadata?.url,
//     title: row.metadata?.title,
//     favicon: row.metadata?.favicon,
//   }));
// }

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { EvidenceSnippet } from "./types";

// Initialize the Google Generative AI client for embeddings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Initialize the Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function searchEvidence(
  query: string,
  matchCount = 5
): Promise<EvidenceSnippet[]> {
  // Generate an embedding for the search query using Gemini
  const embeddingRes = await model.embedContent({
    content: { role: "user", parts: [{ text: query }] },
  });
  const embedding = embeddingRes.embedding.values;

  // Use the generated embedding to find matching documents in Supabase
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: embedding,
    match_count: matchCount,
  });

  if (error) throw error;

  // Format the search results into the EvidenceSnippet type
  return (data || []).map((row: any) => ({
    chunkId: row.id,
    text: row.text,
    source: row.metadata?.source || "Unknown",
    page: row.metadata?.page,
    charStart: row.char_start,
    charEnd: row.char_end,
    url: row.metadata?.url,
    title: row.metadata?.title,
    favicon: row.metadata?.favicon,
  }));
}
