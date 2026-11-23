'use client'

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { masterService } from '../services/masterService'
import type { CreateMasterOptionPayload, CreateMasterTypePayload, MasterBundle, MasterOption, MasterType } from '../types/masters.types'

export const MASTERS_BUNDLE_QUERY_KEY = ['masters', 'bundle'] as const

const EMPTY_BUNDLE: MasterBundle = { types: [], options: {} }

export function useMasterBundle(companyId?: string | null, includeInactive = false, enabled = true) {
  return useQuery<MasterBundle>({
    queryKey: [...MASTERS_BUNDLE_QUERY_KEY, companyId || 'all', includeInactive],
    queryFn: () => masterService.getBundle(companyId, includeInactive),
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: EMPTY_BUNDLE,
  })
}

export function useMasterOptions(typeCode: string, companyId?: string | null) {
  const { data: bundle, isLoading, isFetching, refetch } = useMasterBundle(companyId, false, true)

  const options = useMemo<MasterOption[]>(() => {
    return bundle?.options?.[typeCode] || []
  }, [bundle, typeCode])

  const typeMeta = useMemo<MasterType | undefined>(() => {
    return bundle?.types?.find((t) => t.code === typeCode)
  }, [bundle, typeCode])

  return {
    options,
    typeMeta,
    isLoading: isLoading || isFetching,
    refetch,
  }
}

export function useMasterMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['masters'] })
  }

  const createType = useMutation({
    mutationFn: (payload: CreateMasterTypePayload) => masterService.createType(payload),
    onSuccess: invalidate,
  })

  const updateType = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MasterType> }) =>
      masterService.updateType(id, data),
    onSuccess: invalidate,
  })

  const createOption = useMutation({
    mutationFn: (payload: CreateMasterOptionPayload) => masterService.createOption(payload),
    onSuccess: invalidate,
  })

  const updateOption = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateMasterOptionPayload> }) =>
      masterService.updateOption(id, data),
    onSuccess: invalidate,
  })

  const deleteOption = useMutation({
    mutationFn: (id: number) => masterService.deleteOption(id),
    onSuccess: invalidate,
  })

  const reorderOptions = useMutation({
    mutationFn: (items: Array<{ id: number; sort_order: number }>) =>
      masterService.reorderOptions(items),
    onSuccess: invalidate,
  })

  return {
    createType,
    updateType,
    createOption,
    updateOption,
    deleteOption,
    reorderOptions,
  }
}
