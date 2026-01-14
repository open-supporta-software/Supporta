export interface Rule {
    id: string
    name?: string
    description?: string
    flow: string
    organization_id: string
    trigger_type: string
    created_at: string
    updated_at: string
    status?: 'active' | 'inactive'
}

export interface CreateRuleInput {
    name?: string
    description?: string
    flow: string
    organization_id: string
    trigger_type: string
}

export interface RulesResponse {
    items: Rule[]
    total: number
}

export interface UpdateRuleInput {
    name?: string
    description?: string
    flow?: string
}

export interface NodeAction {
    label: string
    value: string
}

export interface RuleNodeData {
    action: string
    onChange: (value: string) => void
    conditionValue?: string // Used for both condition and action node values
    onConditionValueChange?: (value: string) => void
    triggerType?: string
    onTriggerTypeChange?: (value: string) => void
}

export type NodeType = 'trigger' | 'ternary' | 'condition' | 'action'

export interface RuleFormData {
    name: string
    description: string
    nodes: any[]
    edges: any[]
}
