import { Row, Col } from 'antd'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import React, { CSSProperties, useCallback, useState } from 'react'

import { useDeepCompareEffect } from '@open-condo/codegen/utils/useDeepCompareEffect'
import { Search } from '@open-condo/icons'
import { useIntl } from '@open-condo/next/intl'
import { Typography } from '@open-condo/ui'
import { colors } from '@open-condo/ui/colors'

import Input from '@condo/domains/common/components/antd/Input'
import { PageHeader } from '@condo/domains/common/components/containers/BaseLayout'
import { useContainerSize } from '@condo/domains/common/hooks/useContainerSize'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { B2B_APP_CATEGORIES, ALL_APPS_CATEGORY, CONNECTED_APPS_CATEGORY } from '@helpdesk-web/domains/miniapp/constants'

import { CardGrid } from './CardGrid'

import { useGetAllB2BAppsQuery } from '../../../../gql'

import type { TabContent } from './CardGrid'
import type { MiniAppOutput } from '@app/condo/schema'
import type { RowProps, ColProps } from 'antd'


const SECTION_SPACING: RowProps['gutter'] = [0, 40]
const CONTENT_SPACING: RowProps['gutter'] = [40, 40]
const FULL_COL_SPAN: ColProps['span'] = 24
const TITLE_ROW_HOR_ALIGN_STYLES: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
}
const TITLE_ROW_VERT_ALIGN_STYLES: CSSProperties = {}
const SEARCH_FIXED_STYLES: CSSProperties = { width: 280 }
const SEARCH_FULL_STYLES: CSSProperties = { width: '100%', marginTop: 20 }
const TITLE_COL_THRESHOLD = 500
const ALL_SECTIONS = [
    ALL_APPS_CATEGORY,
    CONNECTED_APPS_CATEGORY,
    ...B2B_APP_CATEGORIES,
]


export const CatalogPageContent: React.FC = () => {
    const intl = useIntl()
    const PageTitle = intl.formatMessage({ id: 'global.section.miniapps' })
    const CategoriesTitles = Object.assign({}, ...ALL_SECTIONS.map(category => ({
        [category]: intl.formatMessage({ id: `miniapps.categories.${category}.name` as FormatjsIntl.Message['ids'] }),
    })))
    const SearchPlaceHolder = intl.formatMessage({ id: 'miniapps.catalog.search.placeholder' })
    const SearchResultsTitle = intl.formatMessage({ id: 'miniapps.catalog.search.results.title' })

    const { publicRuntimeConfig: { activeMiniappIds } } = getConfig()
    const [{ width }, setRef] = useContainerSize<HTMLDivElement>()

    const router = useRouter()
    const { query: { tab } } = router

    const [search, handleSearchChange, handleResetSearch] = useSearch()
    const handleSearchInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        handleSearchChange(event.target.value)
    }, [handleSearchChange])

    // APPS HOOKS
    const [appsCategories, setAppsCategories] = useState<Array<string>>([])
    const [appsTabs, setAppsTabs] = useState<Array<TabContent>>([])

    const appWhere: Record<string, any> = {
        id_in: activeMiniappIds,
    }

    if (search) {
        appWhere.name_contains_i = search
    }

    const { data } = useGetAllB2BAppsQuery({ 
        variables: {
            where: appWhere,
        },
    })

    // Map B2BApp to MiniAppOutput format
    const miniapps = (data?.objs || []).map(app => ({
        id: app.id,
        name: app.name,
        shortDescription: app.shortDescription,
        category: app.category,
        logo: app.logo?.publicUrl || null,
        label: app.label,
        icon: app.icon,
        menuCategory: app.menuCategory,
        connected: false, // B2BApp doesn't have connection info, set default
        accessible: false, // B2BApp doesn't have accessibility info, set default
    }))

    useDeepCompareEffect(() => {
        const tabs = [{ category: ALL_APPS_CATEGORY, apps: miniapps }]

        const connectedApps = miniapps.filter(app => app.connected)
        if (connectedApps.length) {
            tabs.push({ category: CONNECTED_APPS_CATEGORY, apps: connectedApps })
        }
        for (const category of B2B_APP_CATEGORIES) {
            const categoryApps = miniapps.filter(app => app.category === category)
            tabs.push({ category, apps: categoryApps })
        }
        setAppsTabs(tabs as any)
        const categories = tabs.map(tab => tab.category)
        setAppsCategories(categories)
    }, [miniapps])

    const selectedTab = (tab && !Array.isArray(tab) && appsCategories.includes(tab.toUpperCase())) ? tab.toUpperCase() : ALL_APPS_CATEGORY

    return (
        <>
            <PageHeader title={<Typography.Title>{PageTitle}</Typography.Title>}/>
            <Row gutter={SECTION_SPACING}>
                {Boolean(miniapps.length || search) && (
                    <Col span={FULL_COL_SPAN}>
                        <Row gutter={CONTENT_SPACING}>
                            <Col
                                span={FULL_COL_SPAN}
                                ref={setRef}
                                style={width > TITLE_COL_THRESHOLD ? TITLE_ROW_HOR_ALIGN_STYLES : TITLE_ROW_VERT_ALIGN_STYLES}
                            >
                                <Typography.Title level={2}>
                                    {search ? SearchResultsTitle : CategoriesTitles[selectedTab]}
                                </Typography.Title>
                                <Input
                                    placeholder={SearchPlaceHolder}
                                    onChange={handleSearchInputChange}
                                    value={search}
                                    allowClear
                                    style={width > TITLE_COL_THRESHOLD ? SEARCH_FIXED_STYLES : SEARCH_FULL_STYLES}
                                    suffix={<Search size='medium' color={colors.gray[7]}/>}
                                />
                            </Col>
                            <Col span={FULL_COL_SPAN}>
                                <CardGrid
                                    search={search}
                                    resetSearch={handleResetSearch}
                                    tabs={appsTabs}
                                />
                            </Col>
                        </Row>
                    </Col>
                )}
            </Row>
        </>
    )
}