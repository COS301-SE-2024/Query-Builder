"use strict";(self.webpackChunkquery_builder_docs=self.webpackChunkquery_builder_docs||[]).push([[6006],{3900:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>a,contentTitle:()=>o,default:()=>h,frontMatter:()=>t,metadata:()=>l,toc:()=>c});var r=s(6070),i=s(5710);const t={title:"Functional Requirements",description:"The functional requirements of the QBee Query Builder system",sidebar_position:3},o="Functional Requirements",l={id:"requirements-specification/previous-versions/Version1/functional-requirements",title:"Functional Requirements",description:"The functional requirements of the QBee Query Builder system",source:"@site/docs/requirements-specification/previous-versions/Version1/functional-requirements.md",sourceDirName:"requirements-specification/previous-versions/Version1",slug:"/requirements-specification/previous-versions/Version1/functional-requirements",permalink:"/Query-Builder/docs/requirements-specification/previous-versions/Version1/functional-requirements",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:3,frontMatter:{title:"Functional Requirements",description:"The functional requirements of the QBee Query Builder system",sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"User Stories",permalink:"/Query-Builder/docs/requirements-specification/previous-versions/Version1/user-stories"},next:{title:"Service Contracts",permalink:"/Query-Builder/docs/requirements-specification/previous-versions/Version1/service-contracts"}},a={},c=[{value:"1. User Management System",id:"1-user-management-system",level:2},{value:"2. Database System Manager",id:"2-database-system-manager",level:2},{value:"3. Query Builder",id:"3-query-builder",level:2},{value:"4. Reporting System",id:"4-reporting-system",level:2},{value:"5. Organisation Management",id:"5-organisation-management",level:2}];function d(e){const n={h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.h1,{id:"functional-requirements",children:"Functional Requirements"}),"\n",(0,r.jsx)(n.h2,{id:"1-user-management-system",children:"1. User Management System"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Provide a secure authentication process to users."}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Allow users to register on the application through the onboarding process of a one time pin."}),"\n",(0,r.jsx)(n.li,{children:"Allow users to log into the system with their credentials."}),"\n",(0,r.jsx)(n.li,{children:"Allow users to reset their password if forgotten."}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Provide an interface to edit or change user's information"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Allow users to change their personal information (e.g. Name, surname, email, phone number, etc.)."}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Allow users to set personal preferences."}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"2-database-system-manager",children:"2. Database System Manager"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Allow users to connect to external databases and store the database environment for interaction purposes."}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Allow users to update the database connection details. (Various key updates or changes to the database connection details should be allowed)."}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Schema Management:"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Schema mapping: Map the database environment / schema to the intermediate language."}),"\n",(0,r.jsx)(n.li,{children:"Meta data extraction: Extract the meta data from the database schema."}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Query Execution:"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Execute the query on the database. This requires an already translated query from the intermediate language to the database language."}),"\n",(0,r.jsx)(n.li,{children:"Fetch the results from the database. The results should be fetched and displayed to the user."}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"3-query-builder",children:"3. Query Builder"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Allow users to choose a database to query."}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Allow users to create a query."}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Allow users to use a drag and drop UI to create a query."}),"\n",(0,r.jsx)(n.li,{children:"Allow users to create a query via a form."}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Allow users to toggle between views of the query building process."}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Allow users to view a summary of the results of the query."}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Allow users to save queries created."}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"4-reporting-system",children:"4. Reporting System"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Generate Reports: Allow users to generate reports of the query data."}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Graph Reports: Allow users to generate graph reports of the query data."}),"\n",(0,r.jsx)(n.li,{children:"Table Reports: Allow users to generate table reports of the query data."}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Share Reports: Allow users to share the reports generated within the system."}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Allow users to share reports with other users."}),"\n",(0,r.jsx)(n.li,{children:"Allow users to share reports with other organisations."}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Export Reports: Allow users to export the reports generated."}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Allow users to export the reports as a PDF."}),"\n",(0,r.jsx)(n.li,{children:"Allow users to export the reports as a CSV."}),"\n",(0,r.jsx)(n.li,{children:"Allow users to export the reports as an Excel file."}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"5-organisation-management",children:"5. Organisation Management"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Users must be able to create an organisation."}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"A user creating a new organisation will be an admin."}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Users that have an admin role for the organisation will be able to connect a database to the organisation."}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Allow the organisation admin to add other users to the organisation"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Inviting an unregistered QBee User."}),"\n",(0,r.jsx)(n.li,{children:"Existing users must be able to accept invites to an organisation."}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Admin of the organisation will be able to manage user roles for the organisation"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Assign roles in the organisation to the users in the organisation"}),"\n",(0,r.jsx)(n.li,{children:"Manage authorization and access of each role"}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Users must be able to leave the organisation"}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Admin must be able to remove users from the organisation but not other admins"}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\n",(0,r.jsx)(n.p,{children:"Users in the organisation must be able to access organisation saved queries"}),"\n"]}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},5710:(e,n,s)=>{s.d(n,{R:()=>o,x:()=>l});var r=s(758);const i={},t=r.createContext(i);function o(e){const n=r.useContext(t);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),r.createElement(t.Provider,{value:n},e.children)}}}]);