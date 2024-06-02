// import the component you want to make a story for
import DatabaseConnectionModal from "../components/DatabaseConnectionModal/DatabaseConnectionModal"

// A story has a lot of options, but the only required one is to specify the component we want to render
// Setting up the story's default component
export default {
    component: DatabaseConnectionModal
}


// Can have multiple different variants of a component
export const DefaultDatabaseConnectionModal = {

    render: () => <DatabaseConnectionModal/>, // this function specifies how we want to render this variant of the component

};