"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { allCategorys } from "@/services/fetchdata";

export function useCategoryRepository() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await allCategorys();
      setCategories(response || []);
      return response;
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    categories,
    isLoading,
    fetchCategories,
  };
}
