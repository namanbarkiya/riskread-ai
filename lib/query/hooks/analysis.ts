import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Analysis,
  AnalysisListResponse,
  AnalysisQueryParams,
  AnalysisWithResults,
  CreateAnalysisInput,
  UpdateAnalysisInput,
} from "@/lib/types/analysis";

// =====================================================
// QUERY KEYS
// =====================================================

export const analysisKeys = {
  all: ["analysis"] as const,
  lists: () => [...analysisKeys.all, "list"] as const,
  list: (filters: AnalysisQueryParams) =>
    [...analysisKeys.lists(), filters] as const,
  details: () => [...analysisKeys.all, "detail"] as const,
  detail: (id: string) => [...analysisKeys.details(), id] as const,
  status: (id: string) => [...analysisKeys.all, "status", id] as const,
};

// =====================================================
// API FUNCTIONS
// =====================================================

const analysisApi = {
  // Get analysis list
  getAnalysisList: async (
    params?: AnalysisQueryParams
  ): Promise<AnalysisListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.risk_level) queryParams.append("risk_level", params.risk_level);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await fetch(`/api/analysis?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch analysis list");
    }
    return response.json();
  },

  // Get single analysis with results
  getAnalysis: async (id: string): Promise<AnalysisWithResults> => {
    const response = await fetch(`/api/analysis/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch analysis");
    }
    return response.json();
  },

  // Get analysis status
  getAnalysisStatus: async (id: string): Promise<{ status: string }> => {
    const response = await fetch(`/api/analysis/${id}/status`);
    if (!response.ok) {
      throw new Error("Failed to fetch analysis status");
    }
    return response.json();
  },

  // Create new analysis
  createAnalysis: async (input: CreateAnalysisInput): Promise<Analysis> => {
    const response = await fetch("/api/analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error("Failed to create analysis");
    }
    return response.json();
  },

  // Update analysis
  updateAnalysis: async ({
    id,
    updates,
  }: {
    id: string;
    updates: UpdateAnalysisInput;
  }): Promise<Analysis> => {
    const response = await fetch(`/api/analysis/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error("Failed to update analysis");
    }
    return response.json();
  },

  // Delete analysis
  deleteAnalysis: async (id: string): Promise<void> => {
    const response = await fetch(`/api/analysis/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete analysis");
    }
  },
};

// =====================================================
// POLLING CONFIG
// =====================================================

const DEFAULT_ANALYSIS_POLL_INTERVAL_MS = 5000;

// Read from NEXT_PUBLIC_ANALYSIS_POLL_INTERVAL_MS if provided, otherwise fallback.
// This is resolved at build-time by Next.js for client bundles.
const ANALYSIS_POLL_INTERVAL_MS =
  Number(process.env.NEXT_PUBLIC_ANALYSIS_POLL_INTERVAL_MS) ||
  DEFAULT_ANALYSIS_POLL_INTERVAL_MS;

// =====================================================
// QUERY HOOKS
// =====================================================

/**
 * Hook to fetch analysis list with pagination and filters
 */
export const useAnalysisList = (params?: AnalysisQueryParams) => {
  return useQuery({
    queryKey: analysisKeys.list(params || {}),
    queryFn: () => analysisApi.getAnalysisList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on component mount if data exists
  });
};

/**
 * Hook to fetch a single analysis with results
 */
export const useAnalysis = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: analysisKeys.detail(id),
    queryFn: () => analysisApi.getAnalysis(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: (query) => {
      const status = query?.state?.data?.analysis?.status;
      return status === "processing" || status === "pending"
        ? ANALYSIS_POLL_INTERVAL_MS
        : false;
    },
  });
};

/**
 * Hook to fetch analysis status (for real-time updates)
 */
export const useAnalysisStatus = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: analysisKeys.status(id),
    queryFn: () => analysisApi.getAnalysisStatus(id),
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      const status = query?.state?.data?.status;
      return status === "processing" || status === "pending"
        ? ANALYSIS_POLL_INTERVAL_MS
        : false;
    },
    staleTime: 0, // Always consider stale for status
  });
};

// =====================================================
// MUTATION HOOKS
// =====================================================

/**
 * Hook to create a new analysis
 */
export const useCreateAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analysisApi.createAnalysis,
    onSuccess: (newAnalysis) => {
      // Invalidate and refetch analysis list
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });

      // Add to cache immediately for optimistic updates
      queryClient.setQueryData(analysisKeys.detail(newAnalysis.id), {
        analysis: newAnalysis,
        result: null,
      });
    },
    onError: (error) => {
      console.error("Failed to create analysis:", error);
    },
  });
};

/**
 * Hook to update an analysis
 */
export const useUpdateAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analysisApi.updateAnalysis,
    onSuccess: (updatedAnalysis, variables) => {
      // Update the specific analysis in cache
      queryClient.setQueryData(
        analysisKeys.detail(variables.id),
        (oldData: AnalysisWithResults | undefined) => {
          if (!oldData) return { analysis: updatedAnalysis, result: null };
          return {
            ...oldData,
            analysis: updatedAnalysis,
          };
        }
      );

      // Invalidate list queries to reflect changes
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to update analysis:", error);
    },
  });
};

/**
 * Hook to delete an analysis
 */
export const useDeleteAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analysisApi.deleteAnalysis,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: analysisKeys.detail(deletedId) });
      queryClient.removeQueries({ queryKey: analysisKeys.status(deletedId) });

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to delete analysis:", error);
    },
  });
};

// =====================================================
// UTILITY HOOKS
// =====================================================

/**
 * Hook to get analysis statistics
 */
export const useAnalysisStats = () => {
  const { data: analysisList } = useAnalysisList({ limit: 1000 }); // Get all for stats

  if (!analysisList) {
    return {
      total: 0,
      completed: 0,
      failed: 0,
      processing: 0,
      pending: 0,
      avgScore: 0,
      riskLevels: { low: 0, medium: 0, high: 0 },
    };
  }

  const analyses = analysisList.analyses;
  const total = analyses.length;
  const completed = analyses.filter((a) => a.status === "completed").length;
  const failed = analyses.filter((a) => a.status === "failed").length;
  const processing = analyses.filter((a) => a.status === "processing").length;
  const pending = analyses.filter((a) => a.status === "pending").length;

  const avgScore =
    completed > 0
      ? analyses
          .filter((a) => a.overall_score !== null)
          .reduce((sum, a) => sum + (a.overall_score ?? 0), 0) / completed
      : 0;

  const riskLevels = {
    low: analyses.filter((a) => a.risk_level === "low").length,
    medium: analyses.filter((a) => a.risk_level === "medium").length,
    high: analyses.filter((a) => a.risk_level === "high").length,
  };

  return {
    total,
    completed,
    failed,
    processing,
    pending,
    avgScore: Math.round(avgScore * 100) / 100,
    riskLevels,
  };
};

/**
 * Hook to get recent analyses
 */
export const useRecentAnalyses = (limit: number = 5) => {
  const { data: analysisList } = useAnalysisList({
    limit,
    sort_by: "created_at",
    sort_order: "desc",
  });

  return {
    analyses: analysisList?.analyses || [],
    isLoading: !analysisList,
  };
};

/**
 * Hook to get analyses by status
 */
export const useAnalysesByStatus = (status: string) => {
  const { data: analysisList } = useAnalysisList({ status });

  return {
    analyses: analysisList?.analyses || [],
    total: analysisList?.total || 0,
    isLoading: !analysisList,
  };
};

/**
 * Hook to get analyses by risk level
 */
export const useAnalysesByRiskLevel = (riskLevel: string) => {
  const { data: analysisList } = useAnalysisList({ risk_level: riskLevel });

  return {
    analyses: analysisList?.analyses || [],
    total: analysisList?.total || 0,
    isLoading: !analysisList,
  };
};

// =====================================================
// OPTIMISTIC UPDATE HELPERS
// =====================================================

/**
 * Optimistically update analysis status
 */
export const useOptimisticStatusUpdate = () => {
  const queryClient = useQueryClient();

  return (analysisId: string, newStatus: string) => {
    queryClient.setQueryData(
      analysisKeys.detail(analysisId),
      (oldData: AnalysisWithResults | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          analysis: {
            ...oldData.analysis,
            status: newStatus as any,
          },
        };
      }
    );
  };
};

/**
 * Optimistically update analysis score
 */
export const useOptimisticScoreUpdate = () => {
  const queryClient = useQueryClient();

  return (analysisId: string, score: number, riskLevel: string) => {
    queryClient.setQueryData(
      analysisKeys.detail(analysisId),
      (oldData: AnalysisWithResults | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          analysis: {
            ...oldData.analysis,
            overall_score: score,
            risk_level: riskLevel as any,
            status: "completed",
            processing_completed_at: new Date().toISOString(),
          },
        };
      }
    );
  };
};
