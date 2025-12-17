export interface Rule {
    id: string
    name: string
    description: string
    flow: string
    organization_id: string
    createdAt?: string
    updatedAt?: string
    status?: 'active' | 'inactive'
}

export interface CreateRuleInput {
    name: string
    description: string
    flow: string
    organization_id: string
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
}

export type NodeType = 'trigger' | 'ternary' | 'condition' | 'action'

export interface RuleFormData {
    name: string
    description: string
    nodes: any[]
    edges: any[]
}
