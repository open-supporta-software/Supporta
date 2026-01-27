import { Row, Col } from 'antd'
import { Gutter } from 'antd/es/grid/row'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Typography, Button, ActionBar, Table } from '@open-condo/ui'
import type { TableColumn, GetTableData } from '@open-condo/ui'

import { getRules } from '../../domains/rules/api'
import { Rule } from '../../domains/rules/types'
import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { PageComponentType } from '@condo/domains/common/types'


const WRAPPER_GUTTER: Gutter | [Gutter, Gutter] = [0, 40]


const PageTitle = 'Правила'
const CreateRuleButton = 'Добавить правило'
const NameColumn = 'Название'
const DescriptionColumn = 'Описание'
const CreatedAtColumn = 'Дата создания'

const RulesPage: PageComponentType = () => {
    const intl = useIntl()
    const router = useRouter()
    const { organization } = useOrganization()
    
    const [refreshKey, setRefreshKey] = useState(0)

    const columns = useMemo(() => [
        {
            id: 'name',
            header: NameColumn,
            dataKey: 'name',
            initialSize: '25%',
            render: (name) => name || 'Без названия',
        },
        {
            id: 'description',
            header: DescriptionColumn,
            dataKey: 'description',
            initialSize: '35%',
            render: (description) => description || '-',
        },
        {
            id: 'created_at',
            header: CreatedAtColumn,
            dataKey: 'created_at',
            initialSize: '20%',
            render: (created_at) => {
                if (!created_at) return '-'
                return new Date(created_at).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                })
            },
        },
    ], [NameColumn, DescriptionColumn, CreatedAtColumn])

    const dataSource: GetTableData<Rule> = useCallback(async (tableState) => {
        if (!organization?.id) {
            return {
                rowData: [],
                rowCount: 0,
            }
        }

        try {
            const data = await getRules(organization.id)
            return {
                rowData: data,
                rowCount: data.length,
            }
        } catch (error) {
            console.error('Error fetching rules:', error)
            return {
                rowData: [],
                rowCount: 0,
            }
        }
    }, [organization?.id])

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
                                key={refreshKey}
                                id='rules-table'
                                dataSource={dataSource}
                                columns={columns as any}
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
