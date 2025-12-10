import { NodeAction } from './types'

export const TRIGGER_ACTIONS: NodeAction[] = [
    { label: 'Новый тикет создан', value: 'ticket_created' },
    { label: 'Тикет обновлен', value: 'ticket_updated' },
    { label: 'Тикет закрыт', value: 'ticket_closed' },
    { label: 'Тикет назначен', value: 'ticket_assigned' },
    { label: 'Комментарий добавлен', value: 'comment_added' },
]

export const TERNARY_ACTIONS: NodeAction[] = [
    { label: 'Логическое И', value: 'logical_and' },
    { label: 'Логическое ИЛИ', value: 'logical_or' },
]

export const CONDITION_ACTIONS: NodeAction[] = [
    { label: 'Если статус равен', value: 'if_status_equals' },
    { label: 'Если приоритет выше', value: 'if_priority_higher' },
    { label: 'Если исполнитель назначен', value: 'if_executor_assigned' },
    { label: 'Если категория равна', value: 'if_category_equals' },
]

export const ACTION_ACTIONS: NodeAction[] = [
    { label: 'Назначить исполнителя', value: 'assign_executor' },
    { label: 'Изменить статус', value: 'change_status' },
    { label: 'Отправить ответ', value: 'send_answer' },
    { label: 'Изменить приоритет', value: 'change_priority' },
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
