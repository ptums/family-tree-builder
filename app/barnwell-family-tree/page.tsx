"use client";
import FamilyTree from "@/components/FamilyTree";
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
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

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
    <>
      <SignedIn>
        <FormProvider {...methods}>
          <QueryClientProvider client={queryClient}>
            <DialogProvider>
              <FamilyTreeWithQuery />
            </DialogProvider>
          </QueryClientProvider>
        </FormProvider>
      </SignedIn>
      <SignedOut>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <SignIn appearance={{ elements: { card: { width: "350px" } } }} />
        </div>
      </SignedOut>
    </>
  );
}

function FamilyTreeWithQuery() {
  const { data, isLoading, error } = useFamilyData();

  if (isLoading) return <LoadingIcon />;
  if (error) return <div>Error loading family data</div>;

  return <FamilyTree treeData={data as unknown as FamilyNode[]} />;
}
