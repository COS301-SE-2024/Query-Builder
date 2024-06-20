---
sidebar_position: 7
---

# Technology Choices

## Our Backend and API

We have chosen **NestJS** as our Backend and API framework. Its object-oriented approach fits well with our modular system architecture. In addition, by being a Typescript framework it allows us to use compatible testing libraries to unit test both our backend and frontend. The technology choices we considered for our backend and API are as follows:

### NestJS

_NestJS is a progressive NodeJS framework designed for building efficient, reliable, and scalable server-side applications. It leverages TypeScript and incorporates principles from object-oriented programming (OOP), functional programming (FP), and reactive programming, making it a versatile and modern solution for backend development. With a modular architecture, NestJS allows for easy code organization and reusability._

Pros

- NestJS's object-oriented approach allows it to fit in well with our modular architecture and how our class diagram has been designed.
- NestJS provides many RESTful API features 'straight out of the box'
- NestJS allows us to write APIs in Typescript, the same language we have chosen for our frontend, and this in turn allows us to use compatible testing libraries (Vitest and Jest) for both our frontends and backends

Cons

- NestJS introduces a number of concepts that are new to the QBee team, to modularise their code, and thus there is a bit of a learning curve to get to know the technology

### FastAPI

_FastAPI is a modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints._

Pros

- FastAPI allows one to rapidly develop an API with minimal code
- FastAPI applications are written with Python, a popular language with many popular machine learning libraries which we may want to use for Natural Language Processing.

Cons

- FastAPI may be too minimal for our more complex backend tasks that we would like to perform.

### Django

_Django is a free and open-source, Python-based web framework that runs on a web server. It follows the model–template–views architectural pattern._

Pros

- Django applications are written with Python, a popular language with many popular machine learning libraries which we may want to use for Natural Language Processing.

Cons

- Django introduces a number of concepts that are new to the QBee team and thus there is a bit of a learning curve to get to know the technology.

## User Authorisation and Data Storage

We have selected Supabase for user authorization and data storage in our project. Below are details outlining the key advantages Supabase offers, alongside potential drawbacks we had to consider during implementation.

### Reasons for Choosing Supabase

Supabase emerges as a strong contender for user authorization due to several factors:

- **Simplified Backend Management**: Supabase combines a real-time database with built-in user authentication. This eliminates the need to develop and maintain a separate backend server for user management, saving development time and resources.

- **Authentication Features**: Supabase provides robust functionalities like email/password login, social login (e.g., Google, GitHub), passwordless login (magic links), and JWT (JSON Web Token) generation for secure authentication.

- **Scalability**: Supabase boasts a horizontally scalable architecture, allowing your application to handle increasing user loads without significant performance degradation.

- **Developer Experience**: Supabase was a requirement for our mini-project earlier in the semester, and we found it to be easy to use and well-documented. This positive experience influenced our decision to use it for our main project.

### Pros and Cons

While Supabase offers significant benefits, we had to consider potential drawbacks:

- **Vendor Lock-in**: When using the hosted version of Supabase, we are somewhat reliant on their infrastructure and roadmap. While self-hosting is possible, it requires additional expertise and maintenance effort.

- **Limited Customization**: Supabase provides a feature-rich platform, but for highly customized user authorization flows, we encountered limitations compared to building a completely customised solution. For example supabase does not support NestJS as extensively as it does with other frameworks like React or Vue.js, thus integration with our backend was more difficult.

- **Pricing**: Supabase offers a free tier with limited features. For larger projects or those requiring higher storage or bandwidth, paid tiers might be necessary, impacting project costs.

- **Maturity**: As a relatively young platform, Supabase might have a smaller community and less extensive documentation compared to more established solutions.

### Alternative User Authorization and Data Storage Solutions

While Supabase offers a compelling set of features, we did consider other options. Below are two of our considerations with their own advantages and disadvantages:

#### **Firebase**:

A popular backend-as-a-service (BaaS) platform from Google, Firebase provides user authentication, data storage (Cloud Firestore), real-time capabilities, and serverless functions.

Pros:

- Extensive Feature Set: Firebase offers a comprehensive suite of tools beyond user authorization and storage.
- Deep Integration with Google Services: Easy integration with Google products like Google Sign-In and Cloud Functions.
- Mature Platform: Firebase is a well-established platform with a large community and extensive documentation.

Cons:

- Vendor Lock-in: Similar to Supabase, Firebase locks you into Google's infrastructure.
- Pricing: Firebase's free tier has limitations, and pay-as-you-go pricing can become expensive for data-intensive apps, such as QBee.
- Complexity: Firebase's vast feature set can lead to a steeper learning curve compared to Supabase.

#### Backend for Frontend (BFF) with Separate Database:

This approach involves building a custom backend API specifically for QBee's frontend needs. We could have used databases like PostgreSQL or MongoDB for data storage.

Pros:

- Maximum Control and Flexibility: We would have complete control over user authorization flows, data schema, and security.
- Database Choice: Select the database that best suits our data model and performance requirements.

Cons:

- Increased Development Time: Building and maintaining a custom backend requires significant development resources.
- Complexity Management: Managing user authentication, authorization logic, and security can become complex for large-scale projects.

### Conclusion

In summary, Supabase is a strong choice for user authorization and data storage in our project. Its ease of use, and robust feature set align well with QBEE's requirements. While we had to consider potential drawbacks, the benefits of using Supabase outweighed these concerns.


## Our Frontend

### NextJS
 
_Next.js is a powerful React framework developed by Vercel, designed to facilitate the development of server-rendered React applications. It is known for its ability to generate static websites, offering features like server-side rendering (SSR), static site generation (SSG), and incremental static regeneration (ISR), which enhance performance and SEO._

#### Key Features of NextJS:

- **Server-Side Rendering (SSR):** Allows pages to be rendered on the server on each request, improving performance and SEO.

- **Static Site Generation (SSG):** Pre-renders pages at build time, which can be served as static files, providing better performance and lower server costs.

- **Incremental Static Regeneration (ISR):** Enables static pages to be regenerated incrementally after the initial build, combining the benefits of SSG and dynamic content updates.

- **File-based Routing:** Simplifies route management by mapping files in the pages directory to corresponding routes.

- **Automatic Code Splitting:** Automatically splits the code for each page, reducing the initial load time and improving performance.

**Pros:**

- **Improved Performance:** Thanks to SSR, SSG, and ISR, Next.js can deliver high-performance applications.

- **SEO-Friendly:** Built-in SSR improves SEO by enabling search engines to crawl content more effectively.
- **Developer Experience:** Next.js provides a smooth developer experience with features like file-based routing, built-in CSS and Sass support, and API routes.
- **Scalability:** Next.js is suitable for large-scale applications due to its ability to handle complex routing and data fetching.
- **Community and Ecosystem:** Strong community support and integration with the React ecosystem provide access to a wealth of resources and tools.

**Cons:**

- **Build Times:** For large applications, build times can become long, although ISR helps mitigate this.

- **Server-Side Costs:** SSR can increase server costs due to the need to render pages on the server.

### Frontend Trade-offs

#### 1. **NextJS vs. ReactJS**

**Pros of NextJS:**

- Server-Side Rendering (SSR): Next.js offers built-in support for SSR, which can improve SEO and initial page load times.

- Static Site Generation (SSG): Next.js allows for static generation of pages at build time, which can improve performance.

- Automatic Code Splitting: Next.js automatically splits code, leading to better performance and faster load times.

- File-based Routing: Next.js uses a file-based routing system, making it easier to manage routes compared to React's dynamic routing.

- Incremental Static Regeneration (ISR): Allows pages to be statically generated and updated incrementally, improving performance and reducing build times.

**Cons of NextJS:**

- Learning Curve: There is a steeper learning curve compared to using plain React for the QBEE team.

- Build Times: For very large sites, build times can become long, although ISR helps mitigate this.

#### 2. **NextJS vs. Angular**

**Pros of NextJS:**

- Performance: NextJS typically offers better performance due to SSR and SSG capabilities.

- Simplicity: NextJS has a simpler and more flexible architecture compared to Angular's more rigid structure.

- SEO-Friendly: SSR in Next.js makes it more SEO-friendly compared to Angular, which traditionally requires additional configurations for SSR.

- Modern JavaScript: Next.js is built on top of React, leveraging modern JavaScript features and a vast ecosystem.

**Cons of NextJS:**

- Ecosystem: Angular has a more mature and extensive ecosystem with a larger number of built-in features.

- Complex Applications: Angular might be a better fit for very complex enterprise-level applications due to its built-in features like dependency injection, form handling, and state management.

#### 3. **NextJS vs. Flutter**

**Pros of NextJS:**

- Web Optimization: Next.js is optimized for building web applications, offering SSR, SSG, and ISR, which Flutter does not natively support.

- SEO-Friendly: Next.js's SSR and SSG capabilities make it more suitable for SEO than Flutter, which is primarily used for mobile apps.

- Ecosystem: Leveraging the React ecosystem, Next.js benefits from a vast array of libraries and tools.

**Cons of NextJS:**

- Mobile Development: Flutter excels in mobile app development, offering a rich set of widgets and a unified codebase for both iOS and Android.

- UI Consistency: Flutter provides consistent UI across platforms, while Next.js relies on web standards, which might not offer the same level of consistency across different devices.

### Conclusion

In summary, NextJS is a strong choice for our application as it allows us to build a  high-performance, SEO-friendly web application. It offers a balance of simplicity and advanced features, which makes it suitable for our application without having to over complicate our system. This also allows us to leverage the React ecosystem and provide modern development features.