import Error from 'next/error'
import { useRouter } from 'next/router'
import React from 'react'

import { PageComponentType } from '@condo/domains/common/types'
import { isSafeUrl } from '@condo/domains/common/utils/url.utils'
import { ServicesReadPermissionRequired } from '@condo/domains/miniapp/components/PageAccess'
import { B2BAppPage } from '@helpdesk-web/domains/miniapp/components/AppDescription'


const MiniappDescriptionPage: PageComponentType = () => {
    const { query: { id } } = useRouter()

    if (Array.isArray(id) || !id || !isSafeUrl(id)) return <Error statusCode={404}/>

    return <B2BAppPage id={id}/>
}

MiniappDescriptionPage.requiredAccess = ServicesReadPermissionRequired

export default MiniappDescriptionPage
