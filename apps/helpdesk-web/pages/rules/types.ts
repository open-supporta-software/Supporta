export interface Rule {
    id: string
    name: string
    description: string
    createdAt: string
    status: 'active' | 'inactive'
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
