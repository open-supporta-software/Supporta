import { Row, Col } from 'antd'
import { Gutter } from 'antd/es/grid/row'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { Typography, Button, ActionBar, Table } from '@open-condo/ui'
import type { TableColumn, GetTableData } from '@open-condo/ui'

import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { PageComponentType } from '@condo/domains/common/types'

import { Rule } from './types'

const WRAPPER_GUTTER: Gutter | [Gutter, Gutter] = [0, 40]

// Mock data - replace with actual data fetching
const MOCK_RULES: Rule[] = [
    {
        id: '1',
        name: 'Правило автоназначения',
        description: 'Автоматически назначает исполнителя при создании тикета',
        createdAt: '2024-01-15',
        status: 'active',
    },
    {
        id: '2',
        name: 'Уведомление о просрочке',
        description: 'Отправляет уведомление если тикет не закрыт в срок',
        createdAt: '2024-01-20',
        status: 'active',
    },
    {
        id: '3',
        name: 'Эскалация приоритета',
        description: 'Повышает приоритет тикета при определенных условиях',
        createdAt: '2024-02-01',
        status: 'inactive',
    },
]

const RulesPage: PageComponentType = () => {
    const intl = useIntl()
    const router = useRouter()
    
    const PageTitle = 'Правила'
    const CreateRuleButton = 'Добавить правило'
    const NameColumn = 'Название'
    const DescriptionColumn = 'Описание'
    const CreatedAtColumn = 'Дата создания'
    const StatusColumn = 'Статус'

    const columns: TableColumn<Rule>[] = useMemo(() => [
        {
            id: 'name',
            header: NameColumn,
            dataKey: 'name',
            initialSize: '25%',
        },
        {
            id: 'description',
            header: DescriptionColumn,
            dataKey: 'description',
            initialSize: '35%',
        },
        {
            id: 'createdAt',
            header: CreatedAtColumn,
            dataKey: 'createdAt',
            initialSize: '20%',
        },
        {
            id: 'status',
            header: StatusColumn,
            dataKey: 'status',
            initialSize: '20%',
            render: (status) => status === 'active' ? 'Активно' : 'Неактивно',
        },
    ], [NameColumn, DescriptionColumn, CreatedAtColumn, StatusColumn])

    const dataSource: GetTableData<Rule> = useCallback(async () => {
        // Simulate async data fetching
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    rowData: MOCK_RULES,
                    rowCount: MOCK_RULES.length,
                })
            }, 100)
        })
    }, [])

    const handleCreateRule = () => {
        router.push('/rules/create')
    }

    const handleRowClick = (record: Rule) => {
        router.push(`/rules/${record.id}`)
    }

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
                            <Table
                                id='rules-table'
                                dataSource={dataSource}
                                columns={columns}
                                onRowClick={handleRowClick}
                            />
                        </Col>
                        <Col span={24}>
                            <ActionBar
                                actions={[
                                    <Button
                                        key='createRule'
                                        type='primary'
                                        onClick={handleCreateRule}
                                    >
                                        {CreateRuleButton}
                                    </Button>,
                                ]}
                            />
                        </Col>
                    </Row>
                </PageContent>
            </PageWrapper>
        </>
    )
}

export default RulesPage
