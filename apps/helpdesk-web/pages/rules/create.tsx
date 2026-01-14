import { Row, Col, notification } from 'antd'
import { Gutter } from 'antd/es/grid/row'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useState, useRef } from 'react'
import ReactFlow, {
    Node,
    Edge,
    addEdge,
    Connection,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    BackgroundVariant,
    NodeTypes,
    MarkerType,
    useReactFlow,
    ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Typography, Input, Alert, Button } from '@open-condo/ui'


import { createRule } from '../../domains/rules/api'
import { TriggerNode, TernaryNode, ConditionNode, ActionNode } from '../../domains/rules/components/CustomNodes'
import { NodeType } from '../../domains/rules/types'
import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { PageComponentType } from '@condo/domains/common/types'

const WRAPPER_GUTTER: Gutter | [Gutter, Gutter] = [0, 40]

// Node types mapping
const nodeTypes: NodeTypes = {
    trigger: TriggerNode,
    ternary: TernaryNode,
    condition: ConditionNode,
    action: ActionNode,
}

// Initial nodes
const initialNodes: Node[] = [
    {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { 
            action: '', 
            onChange: () => {},
            conditionValue: '',
            onConditionValueChange: () => {},
            triggerType: 'NEW_TICKET',
            onTriggerTypeChange: () => {},
        },
    },
]

const initialEdges: Edge[] = []

// Validation function for node connections
const isValidConnection = (
    connection: Connection,
    nodes: Node[],
    edges: Edge[]
): { valid: boolean, message?: string } => {
    const sourceNode = nodes.find(n => n.id === connection.source)
    const targetNode = nodes.find(n => n.id === connection.target)

    if (!sourceNode || !targetNode) {
        return { valid: false, message: 'Узлы не найдены' }
    }

    const sourceType = sourceNode.type as NodeType
    const targetType = targetNode.type as NodeType

    // Trigger can only be at the start
    if (targetType === 'trigger') {
        return { valid: false, message: 'Триггер может быть только в начале цепочки' }
    }

    // Trigger can connect to anything except another trigger
    if (sourceType === 'trigger') {
        return { valid: true }
    }

    // Action can only be at the end
    if (sourceType === 'action') {
        return { valid: false, message: 'Действие может быть только в конце цепочки' }
    }

    // Ternary and Condition can connect to anything except trigger
    if ((sourceType === 'ternary' || sourceType === 'condition')) {
        return { valid: true }
    }

    return { valid: false, message: 'Недопустимое соединение узлов' }
}

const FlowContent: React.FC = () => {
    const { screenToFlowPosition } = useReactFlow()
    const intl = useIntl()
    const router = useRouter()
    const { organization } = useOrganization()
    
    const PageTitle = 'Создание правила'
    const NameLabel = 'Название'
    const DescriptionLabel = 'Описание'
    const NamePlaceholder = 'Введите название правила'
    const DescriptionPlaceholder = 'Введите описание правила'

    const [ruleName, setRuleName] = useState('')
    const [ruleDescription, setRuleDescription] = useState('')
    const [triggerType, setTriggerType] = useState('NEW_TICKET')
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null)
    const contextMenuPositionRef = useRef<{ x: number, y: number } | null>(null)
    const [isNodePanelOpen, setIsNodePanelOpen] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const onConnect = useCallback(
        (params: Connection | Edge) => {
            const validation = isValidConnection(params as Connection, nodes, edges)
            
            if (!validation.valid) {
                setConnectionError(validation.message || 'Недопустимое соединение')
                setTimeout(() => setConnectionError(null), 3000)
                return
            }

            setConnectionError(null)
            setEdges((eds) => addEdge({
                ...params,
                animated: true,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                },
            }, eds))
        },
        [setEdges, nodes, edges]
    )

    const handleNodeDataChange = useCallback((nodeId: string, newAction: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            action: newAction,
                        },
                    }
                }
                return node
            })
        )
    }, [setNodes])

    const handleConditionValueChange = useCallback((nodeId: string, newValue: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            conditionValue: newValue,
                        },
                    }
                }
                return node
            })
        )
    }, [setNodes])

    const handleTriggerTypeChange = useCallback((nodeId: string, newValue: string) => {
        setTriggerType(newValue)
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            triggerType: newValue,
                        },
                    }
                }
                return node
            })
        )
    }, [setNodes])

    // Update nodes with onChange handlers
    const nodesWithHandlers = nodes.map((node) => ({
        ...node,
        data: {
            ...node.data,
            onChange: (value: string) => handleNodeDataChange(node.id, value),
            onConditionValueChange: (value: string) => handleConditionValueChange(node.id, value),
            onTriggerTypeChange: (value: string) => handleTriggerTypeChange(node.id, value),
        },
    }))

    const hasTrigger = nodes.some(node => node.type === 'trigger')

    const addNode = (type: 'trigger' | 'ternary' | 'condition' | 'action', position?: { x: number, y: number }) => {
        // Prevent adding more than one trigger
        if (type === 'trigger' && hasTrigger) {
            notification.error({
                message: 'Ошибка',
                description: 'Может быть только один триггер',
            })
            return
        }

        const newNode: Node = {
            id: `${Date.now()}`,
            type,
            position: position || { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
            data: { 
                action: '', 
                onChange: () => {},
                conditionValue: '',
                onConditionValueChange: () => {},
                triggerType: type === 'trigger' ? triggerType : undefined,
                onTriggerTypeChange: () => {},
            },
        }
        setNodes((nds) => [...nds, newNode])
        setContextMenu(null)
    }

    const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
        event.preventDefault()
        
        const flowPosition = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        })
        
        contextMenuPositionRef.current = flowPosition
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
        })
    }, [screenToFlowPosition])

    const handlePaneClick = useCallback(() => {
        setContextMenu(null)
    }, [])

    const handleSaveFlow = useCallback(async () => {
        if (!organization?.id) {
            notification.error({
                message: 'Ошибка',
                description: 'Организация не выбрана',
            })
            return
        }

        const flowData = {
            nodes: nodes.map(node => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: {
                    action: node.data.action,
                    conditionValue: node.data.conditionValue,
                    triggerType: node.data.triggerType,
                },
            })),
            edges: edges.map(edge => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
            })),
        }
        
        setIsSaving(true)
        try {
            const result = await createRule({
                name: ruleName,
                description: ruleDescription,
                flow: JSON.stringify(flowData),
                organization_id: organization.id,
                trigger_type: triggerType,
            })
            
            notification.success({
                message: 'Успешно',
                description: `Правило "${ruleName}" сохранено`,
            })
            
            // Redirect to rules list or edit page
            router.push('/rules')
        } catch (error) {
            console.error('Error saving rule:', error)
            notification.error({
                message: 'Ошибка',
                description: error instanceof Error ? error.message : 'Не удалось сохранить правило',
            })
        } finally {
            setIsSaving(false)
        }
    }, [ruleName, ruleDescription, triggerType, nodes, edges, organization, router])

    const handleExportToJSON = useCallback(() => {
        const flowData = {
            name: ruleName,
            description: ruleDescription,
            trigger_type: triggerType,
            nodes: nodes.map(node => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: {
                    action: node.data.action,
                    conditionValue: node.data.conditionValue,
                    triggerType: node.data.triggerType,
                },
            })),
            edges: edges.map(edge => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
            })),
            createdAt: new Date().toISOString(),
        }

        const jsonString = JSON.stringify(flowData, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `rule_${ruleName.replace(/\s+/g, '_').toLowerCase() || 'unnamed'}_${Date.now()}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }, [ruleName, ruleDescription, triggerType, nodes, edges])



    return (
        <>
            <Head>
                <title>{PageTitle}</title>
            </Head>

            <PageWrapper>
                <PageContent>
                    <Row gutter={WRAPPER_GUTTER}>
                        <Col span={24}>
                            <Typography.Title level={1}>{PageTitle}</Typography.Title>
                        </Col>
                        <Col span={24}>
                            <Row gutter={[0, 16]}>
                                <Col span={24}>
                                    <Typography.Text strong>{NameLabel}</Typography.Text>
                                    <Input
                                        value={ruleName}
                                        onChange={(e) => setRuleName(e.target.value)}
                                        placeholder={NamePlaceholder}
                                    />
                                </Col>
                                <Col span={24}>
                                    <Typography.Text strong>{DescriptionLabel}</Typography.Text>
                                    <Input.TextArea
                                        value={ruleDescription}
                                        onChange={(e) => setRuleDescription(e.target.value)}
                                        placeholder={DescriptionPlaceholder}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        {connectionError && (
                            <Col span={24}>
                                <Alert
                                    type='error'
                                    message={connectionError}
                                    showIcon
                                />
                            </Col>
                        )}
                        <Col span={24}>
                            <Typography.Text type='secondary'>
                                Правила соединения: Триггер → (Тернарное выражение / Условие) → Действие
                            </Typography.Text>
                            <div style={{ height: '600px', border: '1px solid #d9d9d9', borderRadius: '8px', position: 'relative' }}>
                                <ReactFlow
                                    nodes={nodesWithHandlers}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    onPaneContextMenu={handlePaneContextMenu}
                                    onPaneClick={handlePaneClick}
                                    nodeTypes={nodeTypes}
                                    fitView
                                    nodesDraggable={true}
                                    nodesConnectable={true}
                                    elementsSelectable={true}
                                    defaultEdgeOptions={{
                                        animated: true,
                                        markerEnd: {
                                            type: MarkerType.ArrowClosed,
                                        },
                                    }}
                                    connectionLineStyle={{ stroke: '#1890ff', strokeWidth: 2 }}
                                    snapToGrid={true}
                                    snapGrid={[15, 15]}
                                >
                                    <Controls />
                                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                                    
                                    {/* Toggle button for node panel */}
                                    <button
                                        onClick={() => setIsNodePanelOpen(!isNodePanelOpen)}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',
                                            zIndex: 5,
                                            background: 'white',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '4px',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            fontSize: '18px',
                                            lineHeight: '1',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        title={isNodePanelOpen ? 'Скрыть панель' : 'Показать панель'}
                                    >
                                        {isNodePanelOpen ? '✕' : '☰'}
                                    </button>

                                    {/* Floating panel with node buttons */}
                                    {isNodePanelOpen && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '50px',
                                                left: '10px',
                                                zIndex: 4,
                                                background: 'white',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                            }}
                                        >
                                            {!hasTrigger && (
                                                <button
                                                    onClick={() => addNode('trigger')}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: '#1890ff',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#096dd9'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = '#1890ff'}
                                                >
                                                    + Триггер
                                                </button>
                                            )}
                                            <button
                                                onClick={() => addNode('ternary')}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#52c41a',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#389e0d'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#52c41a'}
                                            >
                                                + Тернарное выражение
                                            </button>
                                            <button
                                                onClick={() => addNode('condition')}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#faad14',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#d48806'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#faad14'}
                                            >
                                                + Условие
                                            </button>
                                            <button
                                                onClick={() => addNode('action')}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#f5222d',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#cf1322'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#f5222d'}
                                            >
                                                + Действие
                                            </button>
                                        </div>
                                    )}
                                </ReactFlow>
                                {contextMenu && (
                                    <div
                                        style={{
                                            position: 'fixed',
                                            top: contextMenu.y,
                                            left: contextMenu.x,
                                            background: 'white',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                            zIndex: 1000,
                                            minWidth: '200px',
                                        }}
                                    >
                                        {!hasTrigger && (
                                            <div
                                                onClick={() => addNode('trigger', contextMenuPositionRef.current || undefined)}
                                                style={{
                                                    padding: '12px 16px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                            >
                                                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>●</span>
                                                Добавить Триггер
                                            </div>
                                        )}
                                        <div
                                            onClick={() => addNode('ternary', contextMenuPositionRef.current || undefined)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #f0f0f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            <span style={{ color: '#52c41a', fontWeight: 'bold' }}>●</span>
                                            Добавить Тернарное выражение
                                        </div>
                                        <div
                                            onClick={() => addNode('condition', contextMenuPositionRef.current || undefined)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #f0f0f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            <span style={{ color: '#faad14', fontWeight: 'bold' }}>●</span>
                                            Добавить Условие
                                        </div>
                                        <div
                                            onClick={() => addNode('action', contextMenuPositionRef.current || undefined)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            <span style={{ color: '#f5222d', fontWeight: 'bold' }}>●</span>
                                            Добавить Действие
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Col>
                        <Col span={24}>
                            <Row gutter={[16, 16]} justify='space-between'>
                                <Col>
                                    <Button
                                        type='secondary'
                                        onClick={handleExportToJSON}
                                        disabled={!ruleName || nodes.length === 0}
                                    >
                                        Экспорт в JSON
                                    </Button>
                                </Col>
                                <Col>
                                    <Row gutter={[16, 16]}>
                                        <Col>
                                            <Button
                                                type='secondary'
                                                onClick={() => router.push('/rules')}
                                            >
                                                Отмена
                                            </Button>
                                        </Col>
                                        <Col>
                                            <Button
                                                type='primary'
                                                onClick={handleSaveFlow}
                                                disabled={!ruleName || nodes.length === 0 || isSaving || !organization?.id}
                                                loading={isSaving}
                                            >
                                                Сохранить правило
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </PageContent>
            </PageWrapper>
        </>
    )
}

const CreateRulePage: PageComponentType = () => (
    <ReactFlowProvider>
        <FlowContent />
    </ReactFlowProvider>
)

export default CreateRulePage
