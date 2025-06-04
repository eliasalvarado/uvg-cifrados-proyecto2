/**
 * 

 * @param {*} name: The name of the group
 * @param {*} members: An array of user IDs representing the members of the group
 * @returns 
 */
const getGroupObject = ({name, members, key}) => ({
    name,
    members: members ? members : [],
    key: key || null,
})

export default getGroupObject;