"use client";
import FamilyTree from "@/components/FamilyTree";
import { normalizeDBFamilyData } from "@/data/familyTree";
import { FamilyNode } from "@/types/FamilyNode";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { get, set } from "idb-keyval";
import { DialogProvider } from "@/contexts/DialogContext";
import LoadingIcon from "@/components/LoadingIcon";
import { FormProvider, useForm } from "react-hook-form";

const queryClient = new QueryClient();

function useFamilyData() {
  return useQuery({
    queryKey: ["familyData"],
    queryFn: async () => {
      // Try IndexedDB first
      const cached = await get("familyData");
      if (cached) return cached;
      // Fetch from API
      const res = await fetch("/api/family");
      const data = await res.json();
      await set("familyData", data);
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export default function App() {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <QueryClientProvider client={queryClient}>
        <DialogProvider>
          <FamilyTreeWithQuery />
        </DialogProvider>
      </QueryClientProvider>
    </FormProvider>
  );
}

function FamilyTreeWithQuery() {
  const { data, isLoading, error } = useFamilyData();

  if (isLoading) return <LoadingIcon />;
  if (error) return <div>Error loading family data</div>;

  const normalizedData = normalizeDBFamilyData(data as FamilyNode[]);

  return <FamilyTree treeData={normalizedData as unknown as FamilyNode[]} />;
}
