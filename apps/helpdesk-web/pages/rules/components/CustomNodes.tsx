import React from 'react'
import { Handle, Position } from 'reactflow'

import { Select, Input } from '@open-condo/ui'

import { TRIGGER_ACTIONS, TERNARY_ACTIONS, CONDITION_ACTIONS, ACTION_ACTIONS, NODE_COLORS } from '../constants'
import { RuleNodeData } from '../types'

interface NodeProps {
    data: RuleNodeData
}

const handleStyle = {
    width: '16px',
    height: '16px',
    border: '2px solid #555',
    background: '#fff',
}

export const TriggerNode: React.FC<NodeProps> = ({ data }) => {
    return (
        <div style={{
            padding: '16px',
            border: `2px solid ${NODE_COLORS.trigger.border}`,
            borderRadius: '8px',
            background: NODE_COLORS.trigger.background,
            minWidth: '220px',
            position: 'relative',
        }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: NODE_COLORS.trigger.text }}>
                Триггер
            </div>
            <div className='nodrag'>
                <Select
                    value={data.action}
                    onChange={data.onChange}
                    options={TRIGGER_ACTIONS}
                    placeholder='Выберите триггер'
                />
            </div>
            <Handle 
                type='source' 
                position={Position.Right} 
                style={handleStyle}
                isConnectable={true}
            />
        </div>
    )
}

export const TernaryNode: React.FC<NodeProps> = ({ data }) => {
    return (
        <div style={{
            padding: '16px',
            border: `2px solid ${NODE_COLORS.ternary.border}`,
            borderRadius: '8px',
            background: NODE_COLORS.ternary.background,
            minWidth: '220px',
            position: 'relative',
        }}>
            <Handle 
                type='target' 
                position={Position.Left} 
                style={handleStyle}
                isConnectable={true}
            />
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: NODE_COLORS.ternary.text }}>
                Тернарное выражение
            </div>
            <div className='nodrag'>
                <Select
                    value={data.action}
                    onChange={data.onChange}
                    options={TERNARY_ACTIONS}
                    placeholder='Выберите выражение'
                />
            </div>
            <Handle 
                type='source' 
                position={Position.Right} 
                style={handleStyle}
                isConnectable={true}
            />
        </div>
    )
}

export const ConditionNode: React.FC<NodeProps> = ({ data }) => {
    return (
        <div style={{
            padding: '16px',
            border: `2px solid ${NODE_COLORS.condition.border}`,
            borderRadius: '8px',
            background: NODE_COLORS.condition.background,
            minWidth: '220px',
            position: 'relative',
        }}>
            <Handle 
                type='target' 
                position={Position.Left} 
                style={handleStyle}
                isConnectable={true}
            />
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: NODE_COLORS.condition.text }}>
                Условие
            </div>
            <div className='nodrag' style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Select
                    value={data.action}
                    onChange={data.onChange}
                    options={CONDITION_ACTIONS}
                    placeholder='Выберите условие'
                />
                {data.action && (
                    <Input
                        value={data.conditionValue || ''}
                        onChange={(e) => data.onConditionValueChange?.(e.target.value)}
                        placeholder='Введите значение'
                    />
                )}
            </div>
            <Handle 
                type='source' 
                position={Position.Right} 
                style={handleStyle}
                isConnectable={true}
            />
        </div>
    )
}

export const ActionNode: React.FC<NodeProps> = ({ data }) => {
    return (
        <div style={{
            padding: '16px',
            border: `2px solid ${NODE_COLORS.action.border}`,
            borderRadius: '8px',
            background: NODE_COLORS.action.background,
            minWidth: '220px',
            position: 'relative',
        }}>
            <Handle 
                type='target' 
                position={Position.Left} 
                style={handleStyle}
                isConnectable={true}
            />
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: NODE_COLORS.action.text }}>
                Действие
            </div>
            <div className='nodrag' style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Select
                    value={data.action}
                    onChange={data.onChange}
                    options={ACTION_ACTIONS}
                    placeholder='Выберите действие'
                />
                {data.action && (
                    <Input
                        value={data.conditionValue || ''}
                        onChange={(e) => data.onConditionValueChange?.(e.target.value)}
                        placeholder='Введите значение'
                    />
                )}
            </div>
        </div>
    )
}
