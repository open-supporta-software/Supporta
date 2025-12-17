import getConfig from 'next/config'

import { getRequest, postRequest, putRequest } from '@helpdesk-web/domains/common/utils/http'

import { Rule, CreateRuleInput, UpdateRuleInput } from './types'

const getRulesServerDomain = (): string => {
    const { publicRuntimeConfig } = getConfig()
    return publicRuntimeConfig?.rules_server_domain || publicRuntimeConfig?.serverUrl || ''
}

/**
 * Create a new rule
 * POST /api/rules
 */
export const createRule = async (input: CreateRuleInput): Promise<Rule> => {
    const baseUrl = getRulesServerDomain()
    const path = `${baseUrl}/api/rules`
    
    return postRequest<Rule>(path, {
        data: input,
    })
}

/**
 * Get all rules for an organization
 * GET /api/rules?organization_id={id}
 */
export const getRules = async (organizationId: string): Promise<Rule[]> => {
    const baseUrl = getRulesServerDomain()
    const path = `${baseUrl}/api/rules`
    
    return getRequest<Rule[]>(path, {
        query: {
            organization_id: organizationId,
        },
    })
}

/**
 * Get a single rule by ID
 * GET /api/rules/{id}
 */
export const getRule = async (id: string): Promise<Rule> => {
    const baseUrl = getRulesServerDomain()
    const path = `${baseUrl}/api/rules/${id}`
    
    return getRequest<Rule>(path)
}

/**
 * Update a rule
 * PUT /api/rules/{id}
 */
export const updateRule = async (id: string, input: UpdateRuleInput): Promise<Rule> => {
    const baseUrl = getRulesServerDomain()
    const path = `${baseUrl}/api/rules/${id}`
    
    return putRequest<Rule>(path, {
        data: input,
    })
}
