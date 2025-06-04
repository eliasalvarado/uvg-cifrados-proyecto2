/**
 * 

 * @param {*} name: The name of the group
 * @param {*} members: An array of user IDs representing the members of the group
 * @returns 
 */
const getGroupObject = ({name, members}) => ({
    name,
    members: members ? members : []
})

export default getGroupObject;