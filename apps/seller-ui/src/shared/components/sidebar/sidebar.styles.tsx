'use client';

import styled from "styled-components";

export const SidebarWrapper = styled.div`
  background-color: #0a0a0a;
  transition: transform 0.2s ease;
  height: 100%;
  position: fixed;
  transform: translateX(-100%);
  width: 15rem;
  flex-shrink: 0;
  z-index: 202;
  overflow-y: auto;
  border-right: 1px solid #1f1f1f;
  display: flex;
  flex-direction: column;
  padding: 20px 12px;

  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;

  @media (min-width: 768px) {
    margin-left: 0;
    display: flex;
    position: static;
    height: 100vh;
    transform: translateX(0);
  }

  ${(props: any) =>
    props.collapsed &&
    `
    display: inherit;
    margin-left: 0;
    transform: translateX(0);
  `}
`;

export const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.6);
  position: fixed;
  inset: 0;
  z-index: 201;
  transition: opacity 0.3s ease;
  opacity: 0.8;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px 16px 10px;
  border-bottom: 1px solid #1f1f1f;
  margin-bottom: 4px;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 4px;
  flex: 1;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 8px 8px 8px;
  border-top: 1px solid #1f1f1f;

  @media (min-width: 768px) {
    padding-top: 0;
    padding-bottom: 0;
  }
`;

export const Sidebar = {
  Wrapper: SidebarWrapper,
  Header,
  Body,
  Overlay,
  Footer,
};