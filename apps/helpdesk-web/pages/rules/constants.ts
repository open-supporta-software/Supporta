import { NodeAction } from './types'

export const TRIGGER_TYPES: NodeAction[] = [
    { label: 'Новый тикет', value: 'NEW_TICKET' },
]

export const TERNARY_ACTIONS: NodeAction[] = [
    { label: 'Логическое И', value: 'logical_and' },
    { label: 'Логическое ИЛИ', value: 'logical_or' },
]

export const CONDITION_ACTIONS: NodeAction[] = [
    { label: 'Если статус равен', value: 'if_status_equals' },
    { label: 'Если исполнитель назначен', value: 'if_executor_assigned' },
    { label: 'Если ответственный назначен', value: 'if_manager_assigned' },
]

export const ACTION_ACTIONS: NodeAction[] = [
    { label: 'Назначить свободного исполнителя', value: 'assign_available_executor' },
    { label: 'Назначить свободного ответственного', value: 'assign_available_manager' },
    { label: 'Отменить тикет', value: 'decline_ticket' },
    { label: 'Отправить ответ', value: 'send_answer' },
]

export const NODE_COLORS = {
    trigger: {
        border: '#1890ff',
        background: '#e6f7ff',
        text: '#1890ff',
    },
    ternary: {
        border: '#52c41a',
        background: '#f6ffed',
        text: '#52c41a',
    },
    condition: {
        border: '#faad14',
        background: '#fffbe6',
        text: '#faad14',
    },
    action: {
        border: '#f5222d',
        background: '#fff1f0',
        text: '#f5222d',
    },
}
