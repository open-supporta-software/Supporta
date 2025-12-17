import { Row, Col, notification } from 'antd'
import { Gutter } from 'antd/es/grid/row'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState, useEffect } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Typography, Button, ActionBar, Table } from '@open-condo/ui'
import type { TableColumn, GetTableData } from '@open-condo/ui'

import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { PageComponentType } from '@condo/domains/common/types'

import { getRules } from './api'
import { Rule } from './types'

const WRAPPER_GUTTER: Gutter | [Gutter, Gutter] = [0, 40]

const RulesPage: PageComponentType = () => {
    const intl = useIntl()
    const router = useRouter()
    const { organization } = useOrganization()
    
    const [rules, setRules] = useState<Rule[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    
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

    // Fetch rules when organization changes
    useEffect(() => {
        const fetchRules = async () => {
            if (!organization?.id) {
                setRules([])
                return
            }

            setIsLoading(true)
            try {
                const data = await getRules(organization.id)
                setRules(data)
            } catch (error) {
                console.error('Error fetching rules:', error)
                notification.error({
                    message: 'Ошибка',
                    description: 'Не удалось загрузить правила',
                })
                setRules([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchRules()
    }, [organization?.id, refreshKey])

    const dataSource: GetTableData<Rule> = useCallback(async () => {
        return {
            rowData: rules,
            rowCount: rules.length,
        }
    }, [rules])

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
