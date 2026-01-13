import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { Image } from 'antd'
import React from 'react'


const LogoWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  height: 32px;
`

const SunKeyFrames = keyframes`
  from {
    transform: translate(-15px, -12px);
    opacity: 0
  }
  to {
    transform: translate(28px, -15px);
    opacity: 1
  }
`

const SunCSS = css`
  animation: ${SunKeyFrames} 3s ease 1;
  transform: translate(28px, -15px);
`

interface ILogoProps {
    onClick?: (e: React.SyntheticEvent) => void
    minified?: boolean
}

export const Logo: React.FC<ILogoProps> = (props) => {
    const {
        onClick,
        minified,
    } = props

    if (minified) {
        return (
            <LogoWrapper onClick={onClick} className='logo'>
                <Image preview={false} src='/logoDoma.png'/>
            </LogoWrapper>
        )
    }

    return (
        <LogoWrapper onClick={onClick} className='logo'>
            <Image preview={false} css={SunCSS} src='/logoSun.svg'/>
            <Image preview={false} src='/logoDoma.svg'/>
        </LogoWrapper>
    )
}
