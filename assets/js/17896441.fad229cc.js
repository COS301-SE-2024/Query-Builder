"use strict";(self.webpackChunkquery_builder_docs=self.webpackChunkquery_builder_docs||[]).push([[401],{4476:(e,t,n)=>{n.d(t,{A:()=>p});n(758);var s=n(3526),a=n(6202),i=n(9476),l=n(1344),o=n(445),r=n(2167),c=n(6506),d=n(6070);function u(e){return(0,d.jsx)("svg",{viewBox:"0 0 24 24",...e,children:(0,d.jsx)("path",{d:"M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z",fill:"currentColor"})})}const m={breadcrumbHomeIcon:"breadcrumbHomeIcon_Bf33"};function h(){const e=(0,c.A)("/");return(0,d.jsx)("li",{className:"breadcrumbs__item",children:(0,d.jsx)(o.A,{"aria-label":(0,r.T)({id:"theme.docs.breadcrumbs.home",message:"Home page",description:"The ARIA label for the home page in the breadcrumbs"}),className:"breadcrumbs__link",href:e,children:(0,d.jsx)(u,{className:m.breadcrumbHomeIcon})})})}const b={breadcrumbsContainer:"breadcrumbsContainer_WyRE"};function x(e){let{children:t,href:n,isLast:s}=e;const a="breadcrumbs__link";return s?(0,d.jsx)("span",{className:a,itemProp:"name",children:t}):n?(0,d.jsx)(o.A,{className:a,href:n,itemProp:"item",children:(0,d.jsx)("span",{itemProp:"name",children:t})}):(0,d.jsx)("span",{className:a,children:t})}function v(e){let{children:t,active:n,index:a,addMicrodata:i}=e;return(0,d.jsxs)("li",{...i&&{itemScope:!0,itemProp:"itemListElement",itemType:"https://schema.org/ListItem"},className:(0,s.A)("breadcrumbs__item",{"breadcrumbs__item--active":n}),children:[t,(0,d.jsx)("meta",{itemProp:"position",content:String(a+1)})]})}function p(){const e=(0,i.OF)(),t=(0,l.Dt)();return e?(0,d.jsx)("nav",{className:(0,s.A)(a.G.docs.docBreadcrumbs,b.breadcrumbsContainer),"aria-label":(0,r.T)({id:"theme.docs.breadcrumbs.navAriaLabel",message:"Breadcrumbs",description:"The ARIA label for the breadcrumbs"}),children:(0,d.jsxs)("ul",{className:"breadcrumbs",itemScope:!0,itemType:"https://schema.org/BreadcrumbList",children:[t&&(0,d.jsx)(h,{}),e.map(((t,n)=>{const s=n===e.length-1,a="category"===t.type&&t.linkUnlisted?void 0:t.href;return(0,d.jsx)(v,{active:s,index:n,addMicrodata:!!a,children:(0,d.jsx)(x,{href:a,isLast:s,children:t.label})},n)}))]})}):null}},3621:(e,t,n)=>{n.r(t),n.d(t,{default:()=>O});var s=n(758),a=n(6650),i=n(2675),l=n(6070);const o=s.createContext(null);function r(e){let{children:t,content:n}=e;const a=function(e){return(0,s.useMemo)((()=>({metadata:e.metadata,frontMatter:e.frontMatter,assets:e.assets,contentTitle:e.contentTitle,toc:e.toc})),[e])}(n);return(0,l.jsx)(o.Provider,{value:a,children:t})}function c(){const e=(0,s.useContext)(o);if(null===e)throw new i.dV("DocProvider");return e}function d(){const{metadata:e,frontMatter:t,assets:n}=c();return(0,l.jsx)(a.be,{title:e.title,description:e.description,keywords:t.keywords,image:n.image??t.image})}var u=n(3526),m=n(6660),h=n(6024);function b(){const{metadata:e}=c();return(0,l.jsx)(h.A,{previous:e.previous,next:e.next})}var x=n(8582),v=n(9995),p=n(6202),g=n(2167),j=n(445);const f={tag:"tag_v4LY",tagRegular:"tagRegular_uVTT",tagWithCount:"tagWithCount_vPpk"};function _(e){let{permalink:t,label:n,count:s}=e;return(0,l.jsxs)(j.A,{href:t,className:(0,u.A)(f.tag,s?f.tagWithCount:f.tagRegular),children:[n,s&&(0,l.jsx)("span",{children:s})]})}const A={tags:"tags_PB5D",tag:"tag__dbP"};function C(e){let{tags:t}=e;return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("b",{children:(0,l.jsx)(g.A,{id:"theme.tags.tagsListLabel",description:"The label alongside a tag list",children:"Tags:"})}),(0,l.jsx)("ul",{className:(0,u.A)(A.tags,"padding--none","margin-left--sm"),children:t.map((e=>{let{label:t,permalink:n}=e;return(0,l.jsx)("li",{className:A.tag,children:(0,l.jsx)(_,{label:t,permalink:n})},n)}))})]})}var N=n(4096);function L(){const{metadata:e}=c(),{editUrl:t,lastUpdatedAt:n,lastUpdatedBy:s,tags:a}=e,i=a.length>0,o=!!(t||n||s);return i||o?(0,l.jsxs)("footer",{className:(0,u.A)(p.G.docs.docFooter,"docusaurus-mt-lg"),children:[i&&(0,l.jsx)("div",{className:(0,u.A)("row margin-top--sm",p.G.docs.docFooterTagsRow),children:(0,l.jsx)("div",{className:"col",children:(0,l.jsx)(C,{tags:a})})}),o&&(0,l.jsx)(N.A,{className:(0,u.A)("margin-top--sm",p.G.docs.docFooterEditMetaRow),editUrl:t,lastUpdatedAt:n,lastUpdatedBy:s})]}):null}var T=n(8441),k=n(8751);const M={tocCollapsibleButton:"tocCollapsibleButton_wG4g",tocCollapsibleButtonExpanded:"tocCollapsibleButtonExpanded_VbB3"};function B(e){let{collapsed:t,...n}=e;return(0,l.jsx)("button",{type:"button",...n,className:(0,u.A)("clean-btn",M.tocCollapsibleButton,!t&&M.tocCollapsibleButtonExpanded,n.className),children:(0,l.jsx)(g.A,{id:"theme.TOCCollapsible.toggleButtonLabel",description:"The label used by the button on the collapsible TOC component",children:"On this page"})})}const w={tocCollapsible:"tocCollapsible_aCxs",tocCollapsibleContent:"tocCollapsibleContent_bSCi",tocCollapsibleExpanded:"tocCollapsibleExpanded_tZmq"};function y(e){let{toc:t,className:n,minHeadingLevel:s,maxHeadingLevel:a}=e;const{collapsed:i,toggleCollapsed:o}=(0,T.u)({initialState:!0});return(0,l.jsxs)("div",{className:(0,u.A)(w.tocCollapsible,!i&&w.tocCollapsibleExpanded,n),children:[(0,l.jsx)(B,{collapsed:i,onClick:o}),(0,l.jsx)(T.N,{lazy:!0,className:w.tocCollapsibleContent,collapsed:i,children:(0,l.jsx)(k.A,{toc:t,minHeadingLevel:s,maxHeadingLevel:a})})]})}const I={tocMobile:"tocMobile_tngT"};function H(){const{toc:e,frontMatter:t}=c();return(0,l.jsx)(y,{toc:e,minHeadingLevel:t.toc_min_heading_level,maxHeadingLevel:t.toc_max_heading_level,className:(0,u.A)(p.G.docs.docTocMobile,I.tocMobile)})}var V=n(6140);function P(){const{toc:e,frontMatter:t}=c();return(0,l.jsx)(V.A,{toc:e,minHeadingLevel:t.toc_min_heading_level,maxHeadingLevel:t.toc_max_heading_level,className:p.G.docs.docTocDesktop})}var E=n(1036),G=n(5289);function R(e){let{children:t}=e;const n=function(){const{metadata:e,frontMatter:t,contentTitle:n}=c();return t.hide_title||void 0!==n?null:e.title}();return(0,l.jsxs)("div",{className:(0,u.A)(p.G.docs.docMarkdown,"markdown"),children:[n&&(0,l.jsx)("header",{children:(0,l.jsx)(E.A,{as:"h1",children:n})}),(0,l.jsx)(G.A,{children:t})]})}var S=n(4476),D=n(1557);const U={docItemContainer:"docItemContainer_Xik3",docItemCol:"docItemCol_kOE3"};function F(e){let{children:t}=e;const n=function(){const{frontMatter:e,toc:t}=c(),n=(0,m.l)(),s=e.hide_table_of_contents,a=!s&&t.length>0;return{hidden:s,mobile:a?(0,l.jsx)(H,{}):void 0,desktop:!a||"desktop"!==n&&"ssr"!==n?void 0:(0,l.jsx)(P,{})}}(),{metadata:{unlisted:s}}=c();return(0,l.jsxs)("div",{className:"row",children:[(0,l.jsxs)("div",{className:(0,u.A)("col",!n.hidden&&U.docItemCol),children:[s&&(0,l.jsx)(D.A,{}),(0,l.jsx)(x.A,{}),(0,l.jsxs)("div",{className:U.docItemContainer,children:[(0,l.jsxs)("article",{children:[(0,l.jsx)(S.A,{}),(0,l.jsx)(v.A,{}),n.mobile,(0,l.jsx)(R,{children:t}),(0,l.jsx)(L,{})]}),(0,l.jsx)(b,{})]})]}),n.desktop&&(0,l.jsx)("div",{className:"col col--3",children:n.desktop})]})}function O(e){const t=`docs-doc-id-${e.content.metadata.id}`,n=e.content;return(0,l.jsx)(r,{content:e.content,children:(0,l.jsxs)(a.e3,{className:t,children:[(0,l.jsx)(d,{}),(0,l.jsx)(F,{children:(0,l.jsx)(n,{})})]})})}},6024:(e,t,n)=>{n.d(t,{A:()=>r});n(758);var s=n(2167),a=n(3526),i=n(445),l=n(6070);function o(e){const{permalink:t,title:n,subLabel:s,isNext:o}=e;return(0,l.jsxs)(i.A,{className:(0,a.A)("pagination-nav__link",o?"pagination-nav__link--next":"pagination-nav__link--prev"),to:t,children:[s&&(0,l.jsx)("div",{className:"pagination-nav__sublabel",children:s}),(0,l.jsx)("div",{className:"pagination-nav__label",children:n})]})}function r(e){const{previous:t,next:n}=e;return(0,l.jsxs)("nav",{className:"pagination-nav docusaurus-mt-lg","aria-label":(0,s.T)({id:"theme.docs.paginator.navAriaLabel",message:"Docs pages",description:"The ARIA label for the docs pagination"}),children:[t&&(0,l.jsx)(o,{...t,subLabel:(0,l.jsx)(s.A,{id:"theme.docs.paginator.previous",description:"The label used to navigate to the previous doc",children:"Previous"})}),n&&(0,l.jsx)(o,{...n,subLabel:(0,l.jsx)(s.A,{id:"theme.docs.paginator.next",description:"The label used to navigate to the next doc",children:"Next"}),isNext:!0})]})}},9995:(e,t,n)=>{n.d(t,{A:()=>r});n(758);var s=n(3526),a=n(2167),i=n(6202),l=n(1175),o=n(6070);function r(e){let{className:t}=e;const n=(0,l.r)();return n.badge?(0,o.jsx)("span",{className:(0,s.A)(t,i.G.docs.docVersionBadge,"badge badge--secondary"),children:(0,o.jsx)(a.A,{id:"theme.docs.versionBadge.label",values:{versionLabel:n.label},children:"Version: {versionLabel}"})}):null}},8582:(e,t,n)=>{n.d(t,{A:()=>v});n(758);var s=n(3526),a=n(1561),i=n(445),l=n(2167),o=n(1022),r=n(6202),c=n(3544),d=n(1175),u=n(6070);const m={unreleased:function(e){let{siteTitle:t,versionMetadata:n}=e;return(0,u.jsx)(l.A,{id:"theme.docs.versions.unreleasedVersionLabel",description:"The label used to tell the user that he's browsing an unreleased doc version",values:{siteTitle:t,versionLabel:(0,u.jsx)("b",{children:n.label})},children:"This is unreleased documentation for {siteTitle} {versionLabel} version."})},unmaintained:function(e){let{siteTitle:t,versionMetadata:n}=e;return(0,u.jsx)(l.A,{id:"theme.docs.versions.unmaintainedVersionLabel",description:"The label used to tell the user that he's browsing an unmaintained doc version",values:{siteTitle:t,versionLabel:(0,u.jsx)("b",{children:n.label})},children:"This is documentation for {siteTitle} {versionLabel}, which is no longer actively maintained."})}};function h(e){const t=m[e.versionMetadata.banner];return(0,u.jsx)(t,{...e})}function b(e){let{versionLabel:t,to:n,onClick:s}=e;return(0,u.jsx)(l.A,{id:"theme.docs.versions.latestVersionSuggestionLabel",description:"The label used to tell the user to check the latest version",values:{versionLabel:t,latestVersionLink:(0,u.jsx)("b",{children:(0,u.jsx)(i.A,{to:n,onClick:s,children:(0,u.jsx)(l.A,{id:"theme.docs.versions.latestVersionLinkLabel",description:"The label used for the latest version suggestion link label",children:"latest version"})})})},children:"For up-to-date documentation, see the {latestVersionLink} ({versionLabel})."})}function x(e){let{className:t,versionMetadata:n}=e;const{siteConfig:{title:i}}=(0,a.A)(),{pluginId:l}=(0,o.vT)({failfast:!0}),{savePreferredVersionName:d}=(0,c.g1)(l),{latestDocSuggestion:m,latestVersionSuggestion:x}=(0,o.HW)(l),v=m??(p=x).docs.find((e=>e.id===p.mainDocId));var p;return(0,u.jsxs)("div",{className:(0,s.A)(t,r.G.docs.docVersionBanner,"alert alert--warning margin-bottom--md"),role:"alert",children:[(0,u.jsx)("div",{children:(0,u.jsx)(h,{siteTitle:i,versionMetadata:n})}),(0,u.jsx)("div",{className:"margin-top--md",children:(0,u.jsx)(b,{versionLabel:x.label,to:v.path,onClick:()=>d(x.name)})})]})}function v(e){let{className:t}=e;const n=(0,d.r)();return n.banner?(0,u.jsx)(x,{className:t,versionMetadata:n}):null}}}]);