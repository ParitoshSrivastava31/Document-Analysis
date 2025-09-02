// // lib/embeddings.ts
// import OpenAI from "openai";
// import { createClient } from "@supabase/supabase-js";
// import { DocumentChunk } from "./types";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// export async function embedAndStoreChunks(chunks: DocumentChunk[]) {
//   const texts = chunks.map((c) => c.text);

//   const response = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: texts,
//   });

//   const withEmbeddings = chunks.map((chunk, i) => ({
//     ...chunk,
//     embedding: response.data[i].embedding,
//   }));

//   const { error } = await supabase.from("document_chunks").upsert(
//     withEmbeddings.map((c) => ({
//       id: c.id,
//       text: c.text,
//       embedding: c.embedding,
//       char_start: c.charStart,
//       char_end: c.charEnd,
//       metadata: c.metadata,
//     }))
//   );

//   if (error) throw error;
//   return withEmbeddings;
// }

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { DocumentChunk } from "./types";

// Initialize the Google Generative AI client for embeddings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Initialize the Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function embedAndStoreChunks(chunks: DocumentChunk[]) {
  const texts = chunks.map((c) => c.text);

  // Generate embeddings for all chunks in a single batch call using Gemini
  const response = await model.batchEmbedContents({
    requests: texts.map((text) => ({
      model: "models/text-embedding-004",
      content: { role: "user", parts: [{ text }] },
    })),
  });

  const embeddings = response.embeddings;

  // Ensure the number of embeddings returned matches the number of chunks sent
  if (!embeddings || embeddings.length !== chunks.length) {
    throw new Error(
      "Mismatch between the number of chunks and the embeddings generated."
    );
  }

  // Combine the original chunks with their generated embeddings
  const withEmbeddings = chunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i].values,
  }));

  // Store the chunks and their embeddings in the Supabase database
  const { error } = await supabase.from("document_chunks").upsert(
    withEmbeddings.map((c) => ({
      id: c.id,
      text: c.text,
      embedding: c.embedding,
      char_start: c.charStart,
      char_end: c.charEnd,
      metadata: c.metadata,
    }))
  );

  if (error) throw error;
  return withEmbeddings;
}
