// import requestPromise from 'request-promise'
const request = (requestOptions) => {
  // return requestPromise(requestOptions)
  return new Promise((resolve, reject) => {
    let clientRequest = new XMLHttpRequest() // new ClientRequest(requestOptions)
    clientRequest.open(requestOptions.method, requestOptions.uri, true)
    for (let header in requestOptions.headers) {
      clientRequest.setRequestHeader(header, requestOptions.headers[header])
    }
    clientRequest.onerror = (event) => { console.log(event); reject(new Error(event.target.statusText)) }
    clientRequest.ontimeout = (event) => { console.log(event); reject(new Error('Request timeout')) }
    clientRequest.timeout = 30000
    clientRequest.onreadystatechange = (event) => {
      if (event.target.readyState !== 4) return
      if (event.target.status === 200) {
        resolve(event.target.responseText)
      } else {
        reject(event.target.statusText)
      }
    }
    if (requestOptions.body) {
      clientRequest.send(requestOptions.body)
    } else {
      clientRequest.send()
    }
  })
}
const ApiVer = 'v4'

/**
 * Simple is object check.
 * @param {*} item
 * @returns {boolean} Is item object?
 */
const isObject = (item) => {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null)
}

/**
 * Deep merge two objects.
 * @param {Object} target Target object
 * @param {Object} source Source object
 * @returns {Object} Merged object
 */
export const mergeDeep = (target, source) => {
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    })
  }
  return target
}

export const Api = {
  /**
   *  Stringify the options object for request
   *
   * @param {Object} options
   * @returns {string} Seriliazed options to string
   */
  optionsUriEncode (options) {
    if (!options) return ''
    let str = ''
    for (var key in options) {
      if (str !== '') {
        str += '&'
      }
      if (typeof options[key] === 'object') {
        str += key + '=' + JSON.stringify(options[key])
      } else {
        str += key + '=' + options[key]
      }
    }
    return str
  },

  /**
   * Requests all contacts of account
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @returns Promise object
   */
  GetContacts (host, token, tokenType) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/contacts`
    })
  },

  /**
   * Requests to modify the contact
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} contactId Contact Id
   * @param {[{'key': string, 'value': string}]} metadata Array of key/value pairs
   * @returns Promise object
   */
  ModifyContact (host, token, tokenType, contactId, metadata) {
    return request({
      method: 'PUT',
      headers: {
        'Authorization': `${tokenType} ${token}`
      },
      body: metadata ? `metadata=${JSON.stringify(metadata)}` : '',
      uri: `https://${host}/api/${ApiVer}/contacts/${contactId}`
    })
  },

  /**
   * Requests information about single user
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} userId User Id
   * @returns Promise object
   */
  GetUserInfo (host, token, tokenType, userId) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/users/${userId}`
    })
  },

  /**
   * Update users by ID
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} userId User Id
   * @param {Object} profile
   *  @param {string} profile.accountId Account ID
   *  @param {string} profile.role Role in account. Enum: User, Collaborator
   *  @param {boolean} profile.external Make user external
   * @returns Promise object
   */
  ModifyUser (host, token, tokenType, userId, profile) {
    return request({
      method: 'PUT',
      headers: {
        'Authorization': `${tokenType} ${token}`
      },
      body: `profile=${JSON.stringify(profile)}`,
      uri: `https://${host}/api/${ApiVer}/users/${userId}`
    })
  },

  /**
   * Returns complete information about single group.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} groupId Group ID
   * @returns Promise object
   */
  GetGroupInfo (host, token, tokenType, groupId, fields) {
    let body = []
    if (fields) body.push(`fields=${JSON.stringify(fields)}`)
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/groups/${groupId}` + (body.length ? '?' + body.join('&') : '')
    })
  },

  /**
   * Returns all groups in the account.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {Object} options Options
   * @param {string[]} options.fields Array of optional fields to be included in the response model
   * @param {[{'key': string, 'value': string}]} options.metadata Metadata filter, exact match for metadata key or key-value pair
   * @returns Promise object
   */
  GetGroups (host, token, tokenType, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/groups?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Requests to create a new group
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {Object} options Options
   * @param {string} options.title Required. Title of group
   * @param {string} options.members Group users
   * @param {string} options.parent Parent's Id
   * @param {{letter: string, color: string}} options.avatar Group's avatar Object
   * @param {[{'key': string, 'value': string}]} options.metadata Metadata's array
   * @returns Promise object
   */
  CreateGroup (host, token, tokenType, {title, members, parent, avatar, metadata}) {
    if (!title || title === '') throw new Error(`Title, cannot be empty (Api.CreateGroup)`)
    let body = [`title=${title}`]
    if (members) body.push(`members=${JSON.stringify(members)}`)
    if (parent) body.push(`parent=${parent}`)
    if (avatar && avatar.letters && avatar.color) body.push(`avatar=${JSON.stringify(avatar)}`)
    if (metadata) body.push(`metadata=${JSON.stringify(metadata)}`)
    return request({
      method: 'POST',
      headers: {
        'Authorization': `${tokenType} ${token}`
      },
      body: body.join('&'),
      uri: `https://${host}/api/${ApiVer}/groups`
    })
  },

  /**
   * Update group by id
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} groupId Group Id
   * @param {Object} options
   *  @param {string} options.title Title of group
   *  @param {string[]} options.addMembers Add specified users to group
   *  @param {string[]} options.removeMembers Remove specified users from group
   *  @param {string} options.parent Parent group id
   *  @param {[{'key': string, 'value': string}]} options.metadata Metadata's array
   * @returns Promise object
   */
  ModifyGroup (host, token, tokenType, groupId, {title, addMembers, removeMembers, parent, avatar, metadata}) {
    let body = []
    if (title) body.push(`title=${title}`)
    if (addMembers) body.push(`addMembers=${JSON.stringify(addMembers)}`)
    if (removeMembers) body.push(`removeMembers=${JSON.stringify(removeMembers)}`)
    if (parent) body.push(`parent=${parent}`)
    if (avatar && avatar.letters && avatar.color) body.push(`avatar=${JSON.stringify(avatar)}`)
    if (metadata) body.push(`metadata=${JSON.stringify(metadata)}`)
    return request({
      method: 'PUT',
      headers: {
        'Authorization': `${tokenType} ${token}`
      },
      body: body.join('&'),
      uri: `https://${host}/api/${ApiVer}/users/${groupId}`
    })
  },

  /**
   * Deleting groups
   *
   * @param {string} host - Wrike host
   * @param {string} token - Access token
   * @param {string} tokenType - Access token type
   * @param {string} groupId - Id of group
   * @param {boolean} test - Check that group can be removed, default: true
   * @returns Promise object
   */
  DeleteGroup (host, token, tokenType, groupId, test) {
    test = test !== undefined ? test : true
    return request({
      method: 'DELETE',
      headers: {
        'Authorization': `${tokenType} ${token}`
      },
      body: `test=${test}`,
      uri: `https://${host}/api/${ApiVer}/groups/${groupId}`
    })
  },

  /**
   * Requests a tree of folders
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} folderId ID of folder (if false or undefined - request from root and recycle bin folders)
   * @param {Object} options
   *  @param {string} options.permalink Folder permalink, exact match
   *  @param {boolean} options.descendants Adds all descendant folders to search scope
   *  @param {[{'key': string, 'value': string}]} options.metadata Key/value string pairs. Folders metadata filter
   *  @param {[{'id': string, 'value': string}]} options.customField Id/value strins pairs. Custom field filter
   *  @param {Object} options.updatedDate Updated date filter, timestamp semi-open interval.
   *    @param {string} options.updatedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.updatedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *  @param {boolean} options.project Get only projects (true) / only folders (false)
   *  @param {string[]} options.fields array of optional fields to be included in the response model(metadata,hasAttachments,attachmentCount,description,briefDescription,customFields,customColumnIds,superParentIds)
   * @returns Promise object
   */
  GetProjectsAndFolders (host, token, tokenType, parentId, options) {
    return request({
      method: 'GET',
      headers: {
        // 'Content-type': 'application/x-www-form-urlencoded'
        'Authorization': `${tokenType} ${token}`
      },
      uri: `https://${host}/api/${ApiVer}/folders` + (parentId ? `/${parentId}/folders?` : '?') + this.optionsUriEncode(options)
    })
  },

  /**
   * Create a folder within a folder. Specify virtual rootFolderId in order to create a folder in the account root.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} parentId Parent folder Id. Specify virtual rootFolderId in order to create a folder in the account root.
   * @param {Object} options
   *  @param {string} options.title Title, cannot be empty
   *  @param {string} options.description Folder description. If not specified, will be left blank
   *  @param {string[]} options.shareds Array of users to share folder with. Folder is always shared with creator
   *  @param {[{'key': string, 'value': string}]} options.metadata Key/value string pairs. Metadata to be added to newly created folder
   *  @param {[{'id': string, 'value': string}]} options.customFields  Object with custom fields to be set upon task creation
   *  @param {string[]} options.customColumns List of custom fields associated with folder
   *  @param {Object} options.project Project settings in order to create project {ownerIds: array, status: Enum(G), startDate: yyyy-MM-dd, endDate: yyyy-MM-dd, }
   *    @param {string[]} options.project.ownerIds List of project owner IDs
   *    @param {Green|Yellow|Red|Completed|OnHold|Cancelled} options.project.status Project status
   *    @param {string} options.project.startDate Project start date. Format: yyyy-MM-dd
   *    @param {string} options.project.endDate Project end date. Format: yyyy-MM-dd
   * @returns Promise object
   */
  CreateFolder (host, token, tokenType, parentId, {title, description, shareds, metadata, customFields, customColumns, project}) {
    if (!title || title === '') throw new Error(`Title, cannot be empty (Api.CreateFolder)`)
    let body = [`title=${title}`]
    if (description) body.push(`description=${description}`)
    if (shareds) body.push(`shareds=${JSON.stringify(shareds)}`)
    if (metadata) body.push(`metadata=${JSON.stringify(metadata)}`)
    if (customFields) body.push(`customFields=${JSON.stringify(customFields)}`)
    if (customColumns) body.push(`customColumns=${JSON.stringify(customColumns)}`)
    if (project) body.push(`project=${JSON.stringify(project)}`)
    return request({
      method: 'POST',
      headers: {
        'Authorization': `${tokenType} ${token}`
      },
      body: body.join('&'),
      uri: `https://${host}/api/${ApiVer}/folders/${parentId}/folders`
    })
  },

  /**
   * Copy folder subtree, returns parent folder subtree
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} folderId ID of folder
   * @param {string} parentId ID of parent folder
   * @param {Object} options Options
   *  @param {string} options.title Title, cannot be empty
   *  @param {string} options.titlePrefix Title prefix for all copied tasks
   *  @param {boolean} options.copyDescriptions Copy descriptions or leave empty. Default: true
   *  @param {boolean} options.copyResponsibles Copy responsibles. Default: true
   *  @param {sting[]} options.addResponsibles Add specified users to task responsible list
   *  @param {string[]} options.removeResponsibles Remove specified users from task responsible list
   *  @param {boolean} options.copyCustomFields Copy custom fields. Default: true
   *  @param {boolean} options.copyCustomStatuses Copy custom statuses or set according to workflow otherwise. Default: true
   *  @param {boolean} options.copyStatuses Copy task statuses or set to Active otherwise. Default: true
   *  @param {boolean} options.copyParents Preserve parent folders. Default: false
   *  @param {string} options.rescheduleDate Date to use in task rescheduling. Note that only active tasks can be rescheduled. To activate and reschedule all tasks, use 'rescheduleDate' in combination with copyStatuses = false. Format: yyyy-MM-dd
   *  @param {string} options.rescheduleMode Mode to be used for rescheduling (based on first or last date), has effect only if reschedule date is specified. Enum: Start, End. Default: Start
   *  @param {number} options.entryLimit Limit maximum allowed number for tasks/folders in tree for copy, operation will fail if limit is exceeded, should be 1..250. Default: 250
   * @returns Promise object
   */
  CopyFolder (host, token, tokenType, folderId, parentId, {title, titlePrefix, copyDescriptions, copyResponsibles, addResponsibles, removeResponsibles, copyCustomFields, copyCustomStatuses, copyStatuses, copyParents, rescheduleDate, rescheduleMode, entryLimit}) {
    if (!parentId) throw new Error(`Parent ID, cannot be undefined (Api.CreateFolder)`)
    if (!title || title === '') throw new Error(`Title, cannot be empty (Api.CreateFolder)`)
    let body = [`parent=${parentId}`, `title=${title}`]
    if (titlePrefix) body.push(`titlePrefix=${titlePrefix}`)
    if (copyDescriptions !== undefined) body.push(`copyDescriptions=${copyDescriptions}`)
    if (copyResponsibles !== undefined) body.push(`copyResponsibles=${copyResponsibles}`)
    if (addResponsibles) body.push(`addResponsibles=${JSON.stringify(addResponsibles)}`)
    if (removeResponsibles) body.push(`removeResponsibles=${JSON.stringify(removeResponsibles)}`)
    if (copyCustomFields !== undefined) body.push(`copyCustomFields=${copyCustomFields}`)
    if (copyCustomStatuses !== undefined) body.push(`copyCustomStatuses=${copyCustomStatuses}`)
    if (copyStatuses !== undefined) body.push(`copyStatuses=${copyStatuses}`)
    if (copyParents !== undefined) body.push(`copyParents=${copyParents}`)
    if (rescheduleDate) body.push(`rescheduleDate=${rescheduleDate}`)
    if (rescheduleMode) body.push(`rescheduleMode=${rescheduleMode}`)
    if (entryLimit !== undefined) body.push(`entryLimit=${entryLimit}`)
    return request({
      method: 'POST',
      headers: {
        'Authorization': `${tokenType} ${token}`
      },
      body: body.join('&'),
      uri: `https://${host}/api/${ApiVer}/copy_folder/${folderId}`
    })
  },

  /**
   * Update folder.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} folderId ID of folder
   * @param {Object} options Options
   *  @param {string} options.title Title, cannot be empty
   *  @param {string} options.description Folder description. If not specified, will be left blank
   *  @param {string[]} options.addParents Parent folders from same account to add, cannot contain rootFolderId and recycleBinId
   *  @param {string[]} options.removeParents Parent folders from same account to remove, cannot contain rootFolderId and recycleBinId
   *  @param {string[]} options.addShareds Share folder with specified users
   *  @param {string[]} options.removeShareds Unshare folder from specified users
   *  @param {[{'key': string, 'value': string}]} options.metadata Key/value string pairs. Metadata to be updated
   *  @param {boolean} options.restore Restore folder from Recycled Bin
   *  @param {[{'id': string, 'value': string}]} options.customFields  Custom fields to be updated or deleted (null value removes field)
   *  @param {string[]} options.customColumns List of custom fields associated with folder
   *  @param {Object} options.project Project settings in order to create project {ownersAdd: array, ownersRemove: array, status: Enum(Green, Yellow, Red, Completed, OnHold, Cancelled), startDate: yyyy-MM-dd, endDate: yyyy-MM-dd, }
   *    @param {string[]} options.project.ownersAdd List of project owner IDs for adding
   *    @param {string[]} options.project.ownersRemove List of project owner IDs for removing
   *    @param {Green|Yellow|Red|Completed|OnHold|Cancelled} options.project.status Project status
   *    @param {string} options.project.startDate Project start date. Format: yyyy-MM-dd
   *    @param {string} options.project.endDate Project end date. Format: yyyy-MM-dd
   * @returns Promise object
   */
  ModifyFolder (host, token, tokenType, folderId, {title, description, addParents, removeParents, addShareds, removeShareds, metadata, restore, customFields, customColumns, project}) {
    if (!title || title === '') throw new Error(`Title, cannot be empty (Api.CreateFolder)`)
    let body = [`title=${title}`]
    if (description) body.push(`description=${description}`)
    if (addParents) body.push(`addParents=${JSON.stringify(addParents)}`)
    if (removeParents) body.push(`removeParents=${JSON.stringify(removeParents)}`)
    if (addShareds) body.push(`addShareds=${JSON.stringify(addShareds)}`)
    if (removeShareds) body.push(`removeShareds=${JSON.stringify(removeShareds)}`)
    if (metadata) body.push(`metadata=${JSON.stringify(metadata)}`)
    if (restore) body.push(`restore=${restore}`)
    if (customFields) body.push(`customFields=${JSON.stringify(metadata)}`)
    if (customColumns) body.push(`customColumns=${JSON.stringify(customColumns)}`)
    if (project) body.push(`project=${JSON.stringify(project)}`)
    return request({
      method: 'PUT',
      headers: {'Authorization': `${tokenType} ${token}`},
      body: body.join('&'),
      url: `https://${host}/api/${ApiVer}/folders/${folderId}`
    })
  },

  /**
   * Move folder and all descendant folders and tasks to Recycle Bin unless they have parents outside of deletion scope
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} folderId ID of folder
   * @returns Promise object
   */
  DeleteFolder (host, token, tokenType, folderId) {
    return request({
      method: 'DELETE',
      headers: {'Authorization': `${tokenType} ${token}`},
      url: `https://${host}/api/${ApiVer}/folders/${folderId}`
    })
  },

  /**
   * Search among tasks in the account or in the folder.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} folderId ID of folder
   * @param {Object} options Options
   *  @param {number} options.pageSize Page size
   *  @param {string} options.nextPageToken Next page token, overrides any other parameters in request
   *  @param {boolean} options.descendants Adds all descendant folders to search scope
   *  @param {string} options.title Title filter, exact match
   *  @param {string[]} options.status Status filter, match with any of specified constants Task Status, Enum: Active, Completed, Deferred, Cancelled
   *  @param {High|Normal|Low} options.importance Importance filter, exact match Task Importance
   *  @param {Object} options.startDate Start date filter, date match or range.
   *    @param {string} options.startDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.startDate.equal Date exact match value. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.startDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *  @param {Object} options.dueDate Due date filter, date match or range.
   *    @param {string} options.dueDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.dueDate.equal Date exact match value. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.dueDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *  @param {Object} options.sheduledDate Scheduled date filter. Both dates should be set in ranged version. Returns all tasks that have schedule intersecting with specified interval, date match or range
   *    @param {string} options.sheduledDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.sheduledDate.equal Date exact match value. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.sheduledDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *  @param {Object} options.createdDate Created date filter, date match or range.
   *    @param {string} options.createdDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.createdDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *  @param {Object} options.updatedDate Updated date filter, date match or range. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.updatedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.updatedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *  @param {Object} options.completedDate Completed date filter, date match or range. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional) {start: Range start, equal: Date exact match value, end: Range end }
   *    @param {string} options.completedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.completedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *  @param {string[]} options.authors Authors filter, match of any
   *  @param {string[]} options.responsibles Responsibles filter, match of any
   *  @param {string} options.permalink Task permalink, exact match
   *  @param {Backlog|Milestone|Planned} options.type Task type
   * @returns Promise object
   */
  GetTasks (host, token, tokenType, folderId, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: (folderId ? `https://${host}/api/${ApiVer}/folders/${folderId}/tasks?` : `https://${host}/api/${ApiVer}/tasks?`) + this.optionsUriEncode(options)
    })
  },

  /**
   * Create task in folder. You can specify rootFolderId to create task in user's account root.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} folderId ID of folder
   * @param {Object} options Options
   *  @param {string} options.title Title of task, required
   *  @param {string} options.description Description of task, will be left blank, if not set
   *  @param {Active|Completed|Deferred|Cancelled} options.status Status of task.
   *  @param {High|Normal|Low} options.importance Importance of task
   *  @param {Object} options.dates Task dates. If not specified, a backlogged task is created
   *    @param {Backlog|Milestone|Planned} options.dates.type Type
   *    @param {number} options.dates.duration Duration in minutes. Duration is present in Planned tasks and is optional for Backlog tasks. [0, 1800000)
   *    @param {string} options.dates.start Start date is present only in Planned tasks. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.dates.due Due date is present only in Planned and Milestone tasks. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {boolean} options.dates.workOnWeekends Weekends are included in task scheduling
   *  @param {string[]} options.shareds Shares task with specified users. The task is always shared with the author.
   *  @param {string[]} options.parents Parent folders for newly created task. Can not contain recycleBinId.
   *  @param {string[]} options.responsibles Makes specified users responsible for the task
   *  @param {string[]} options.followers Add specified users to task followers
   *  @param {boolean} options.follow Follow task
   *  @param {string} options.priorityBefore Put newly created task before specified task in task list (Task ID)
   *  @param {string} options.priorityAfter Put newly created task after specified task in task list (Task ID)
   *  @param {string[]} options.superTasks Add the task as subtask to specified tasks
   *  @param {[{'key': string, 'value': string}]} options.metadata Key/value string pairs. Metadata to be added to newly created task
   *  @param {[{'id': string, 'value': string}]} options.customFields List of custom fields to set in newly created task
   *  @param {string} options.customStatus Custom status ID
   * @returns Promise object
   */
  CreateTask (host, token, tokenType, folderId, options) {
    return request({
      method: 'POST',
      headers: {'Authorization': `${tokenType} ${token}`},
      body: this.optionsUriEncode(options),
      uri: `https://${host}/api/${ApiVer}/folders/${folderId}/tasks`
    })
  },

  /**
   * Update task.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} taskId ID of task
   * @param {Object} options Options
   *  @param {string} options.title Title of task
   *  @param {string} options.description Description of task
   *  @param {Active|Completed|Deferred|Cancelled} options.status Status of task.
   *  @param {High|Normal|Low} options.importance Importance of task
   *  @param {Object} options.dates Task dates. If not specified, a backlogged task is created
   *    @param {Backlog|Milestone|Planned} options.dates.type Type
   *    @param {number} options.dates.duration Duration in minutes. Duration is present in Planned tasks and is optional for Backlog tasks. [0, 1800000)
   *    @param {string} options.dates.start Start date is present only in Planned tasks. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {string} options.dates.due Due date is present only in Planned and Milestone tasks. Format: yyyy-MM-dd'T'HH:mm:ss ('T'HH:mm:ss is optional)
   *    @param {boolean} options.dates.workOnWeekends Weekends are included in task scheduling
   *  @param {string[]} options.addShareds Shared task with specified users
   *  @param {string[]} options.removeShareds Unshared task from specified users
   *  @param {string[]} options.addParents Put task into specified folders of same account. Cannot contain RecycleBin folder
   *  @param {string[]} options.removeParents Remove task from specified folders. Can not contain RecycleBin folder
   *  @param {string[]} options.addResponsibles Add specified users to responsible list
   *  @param {string[]} options.removeResponsibles Remove specified users from responsible list
   *  @param {string[]} options.addFollowers Add specified users to task followers
   *  @param {string[]} options.removeFollowers Remove specified users from task followers
   *  @param {boolean} options.follow Follow task
   *  @param {string} options.priorityBefore Put newly created task before specified task in task list (Task ID)
   *  @param {string} options.priorityAfter Put newly created task after specified task in task list (Task ID)
   *  @param {string[]} options.addSuperTasks Add the task as subtask to specified tasks
   *  @param {string[]} options.removeSuperTasks Remove the task as subtask from specified tasks
   *  @param {[{'key': string, 'value': string}]} options.metadata Key/value string pairs. Metadata to be added to newly created task
   *  @param {[{'id': string, 'value': string}]} options.customFields List of custom fields to set in newly created task
   *  @param {string} options.customStatus Custom status ID
   *  @param {boolean} options.restore Restore task from Recycled Bin
   * @returns Promise object
   */
  ModifyTask (host, token, tokenType, taskId, options) {
    return request({
      method: 'PUT',
      headers: {'Authorization': `${tokenType} ${token}`},
      body: this.optionsUriEncode(options),
      uri: `https://${host}/api/${ApiVer}/tasks/${taskId}`
    })
  },

  /**
   * Delete task by Id.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} taskId ID of task
   * @returns Promise object
   */
  DeleteTask (host, token, tokenType, taskId) {
    return request({
      method: 'DELETE',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/tasks/${taskId}`
    })
  },

  /**
   * Get all comments in current account.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} taskId ID of task
   * @param {Object} options Options
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   *  @param {Object} options.updatedDate Updated date filter, get all comments created or updated in the range specified by dates. Time range between dates must be less than 7 days. Default: last 7 days
   *    @param {string} options.updatedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.updatedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {number} options.limit Maximum number of returned comments. Default: 1000
   * @returns Promise object
   */
  GetComments (host, token, tokenType, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/comments?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Get folder comments.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} folderId ID of folder
   * @param {Object} options Options
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   * @returns Promise object
   */
  GetCommentsOfFolder (host, token, tokenType, folderId, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/folders/${folderId}/comments?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Get task comments.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} taskId ID of task
   * @param {Object} options Options
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   * @returns Promise object
   */
  GetCommentsOfTask (host, token, tokenType, taskId, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/tasks/${taskId}/comments?` + this.optionsUriEncode(options)
    })
  },

  /**
   *  Get single or multiple comments by their IDs.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} commentsIds IDs of comment, up to 100 IDs
   * @param {Object} options Options
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   * @returns Promise object
   */
  GetCommentsByIds (host, token, tokenType, commentsIds, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/comments/` + commentsIds.join() + '?' + this.optionsUriEncode(options)
    })
  },

  /**
   * Create a comment in the folder. The virtual Root and Recycle Bin folders cannot have comments.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} folderId IDs of folder
   * @param {string} text Comment text, can not be empty
   * @param {boolean} plainText Treat comment text as plain text, HTML otherwise. Default: false
   * @returns Promise object
   */
  CreateCommentOfFolder (host, token, tokenType, folderId, text, plainText) {
    if (text || text === '') throw new Error('Comment text can not be empty (Api.CreateCommentOfFolder)')
    return request({
      method: 'POST',
      headers: {'Authorization': `${tokenType} ${token}`},
      body: `text=${text}` + (plainText !== undefined ? `&plainText=${plainText}` : ''),
      uri: `https://${host}/api/${ApiVer}/folders/${folderId}/comments`
    })
  },

  /**
   * Create comment in task.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} taskId IDs of task
   * @param {string} text Comment text, can not be empty
   * @param {boolean} plainText Treat comment text as plain text, HTML otherwise. Default: false
   * @returns Promise object
   */
  CreateCommentOfTask (host, token, tokenType, taskId, text, plainText) {
    if (text || text === '') throw new Error('Comment text can not be empty (Api.CreateCommentOfTask)')
    return request({
      method: 'POST',
      headers: {'Authorization': `${tokenType} ${token}`},
      body: `text=${text}` + (plainText !== undefined ? `&plainText=${plainText}` : ''),
      uri: `https://${host}/api/${ApiVer}/tasks/${taskId}/comments`
    })
  },

  /**
   *  Update Comment by ID. A comment is available for updates only during the 5 minutes after creation.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} commentId IDs of comment
   * @param {string} text Comment text, can not be empty
   * @param {boolean} plainText Treat comment text as plain text, HTML otherwise. Default: false
   * @returns Promise object
   */
  UpdateComment (host, token, tokenType, commentId, text, plainText) {
    if (text || text === '') throw new Error('Comment text can not be empty (Api.UpdateComment)')
    return request({
      method: 'PUT',
      headers: {'Authorization': `${tokenType} ${token}`},
      body: `text=${text}` + (plainText !== undefined ? `&plainText=${plainText}` : ''),
      uri: `https://${host}/api/${ApiVer}/comments/${commentId}`
    })
  },

  /**
   * Delete comment by ID.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} commentId IDs of comment
   * @returns Promise object
   */
  DeleteComment (host, token, tokenType, commentId) {
    return request({
      method: 'DELETE',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/comments/${commentId}`
    })
  },

  /**
   * Get task dependencies.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} taskId IDs of task
   * @returns Promise object
   */
  GetDependencies (host, token, tokenType, taskId) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/tasks/${taskId}/dependencies`
    })
  },

  /**
   * Add dependency between tasks.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} taskId IDs of task
   * @param {object} options Options
   *  @param {string} options.predecessorId Add predecessor task, only one of predecessorId/successorId fields can be specified
   *  @param {string} options.successorId Add successor task, only one of predecessorId/successorId fields can be specified
   *  @param {StartToStart|StartToFinish|FinishToStart|FinishToFinish} options.relationType Relation between Predecessor and Successor
   * @returns Promise object
   */
  CreateDependencies (host, token, tokenType, taskId, options) {
    return request({
      method: 'POST',
      headers: {'Authorization': `${tokenType} ${token}`},
      body: this.optionsUriEncode(options),
      uri: `https://${host}/api/${ApiVer}/tasks/${taskId}/dependencies`
    })
  },

  /**
   * Change relationType of task dependency.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} dependencyId IDs of task
   * @param {Object} options Options
   *  @param {StartToStart|StartToFinish|FinishToStart|FinishToFinish} options.relationType Relation between Predecessor and Successor
   * @returns Promise object
   */
  ModifyDependencies (host, token, tokenType, dependencyId, options) {
    return request({
      method: 'PUT',
      headers: {'Authorization': `${tokenType} ${token}`},
      body: this.optionsUriEncode(options),
      uri: `https://${host}/api/${ApiVer}/dependencies/${dependencyId}`
    })
  },

  /**
   * Delete dependency between tasks.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} dependencyId IDs of task
   * @returns Promise object
   */
  DeleteDependencies (host, token, tokenType, dependencyId) {
    return request({
      method: 'DELETE',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/dependencies/${dependencyId}`
    })
  },

  /**
   * Get all timelog records in the account.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {Object} options Options
   *  @param {Object} options.createdDate Created date filter, exact match or range
   *    @param {string} options.createdDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.createdDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {Object} options.updatedDate Last updated date filter, exact match or range
   *    @param {string} options.updatedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.updatedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {Object} options.trackedDate Tracked date filter, exact match or range
   *    @param {string} options.trackedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.trackedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {boolean} options.me If present - only timelogs created by current user are returned
   *  @param {boolean} options.descendants Adds all descendant tasks to search scope. Default: true
   *  @param {boolean} options.subTasks Adds subtasks to search scope. Default: true
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   *  @param {string[]} options.timelogCategories Get timelog records for specified categories
   * @returns Promise object
   */
  GetTimelogs (host, token, tokenType, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/timelogs?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Get all timelog records that were created by the user.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} contactId ID of contact
   * @param {Object} options Options
   *  @param {Object} options.createdDate Created date filter, exact match or range
   *    @param {string} options.createdDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.createdDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {Object} options.updatedDate Last updated date filter, exact match or range
   *    @param {string} options.updatedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.updatedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {Object} options.trackedDate Tracked date filter, exact match or range
   *    @param {string} options.trackedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.trackedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {boolean} options.me If present - only timelogs created by current user are returned
   *  @param {boolean} options.descendants Adds all descendant tasks to search scope. Default: true
   *  @param {boolean} options.subTasks Adds subtasks to search scope. Default: true
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   *  @param {string[]} options.timelogCategories Get timelog records for specified categories
   * @returns Promise object
   */
  GetTimelogsByUser (host, token, tokenType, contactId, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/contacts/${contactId}/timelogs?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Get all timelog records for a folder.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} folderId ID of folder
   * @param {Object} options Options
   *  @param {Object} options.createdDate Created date filter, exact match or range
   *    @param {string} options.createdDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.createdDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {Object} options.updatedDate Last updated date filter, exact match or range
   *    @param {string} options.updatedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.updatedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {Object} options.trackedDate Tracked date filter, exact match or range
   *    @param {string} options.trackedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.trackedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {boolean} options.me If present - only timelogs created by current user are returned
   *  @param {boolean} options.descendants Adds all descendant tasks to search scope. Default: true
   *  @param {boolean} options.subTasks Adds subtasks to search scope. Default: true
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   *  @param {string[]} options.timelogCategories Get timelog records for specified categories
   * @returns Promise object
   */
  GetTimelogsOfFolder (host, token, tokenType, folderId, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/folders/${folderId}/timelogs?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Get all timelog records for a task.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} taskId ID of task
   * @param {Object} options Options
   *  @param {Object} options.createdDate Created date filter, exact match or range
   *    @param {string} options.createdDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.createdDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {Object} options.updatedDate Last updated date filter, exact match or range
   *    @param {string} options.updatedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.updatedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {Object} options.trackedDate Tracked date filter, exact match or range
   *    @param {string} options.trackedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.trackedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {boolean} options.me If present - only timelogs created by current user are returned
   *  @param {boolean} options.descendants Adds all descendant tasks to search scope. Default: true
   *  @param {boolean} options.subTasks Adds subtasks to search scope. Default: true
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   *  @param {string[]} options.timelogCategories Get timelog records for specified categories
   * @returns Promise object
   */
  GetTimelogsOfTask (host, token, tokenType, taskId, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/tasks/${taskId}/timelogs?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Get all timelog records with specific timelog category.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} categoryId ID of specific category
   * @param {Object} options Options
   *  @param {Object} options.createdDate Created date filter, exact match or range
   *    @param {string} options.createdDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.createdDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {Object} options.updatedDate Last updated date filter, exact match or range
   *    @param {string} options.updatedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.updatedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {Object} options.trackedDate Tracked date filter, exact match or range
   *    @param {string} options.trackedDate.start Range start. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.trackedDate.end Range end. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {boolean} options.me If present - only timelogs created by current user are returned
   *  @param {boolean} options.descendants Adds all descendant tasks to search scope. Default: true
   *  @param {boolean} options.subTasks Adds subtasks to search scope. Default: true
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   *  @param {string[]} options.timelogCategories Get timelog records for specified categories
   * @returns Promise object
   */
  GetTimelogsbyCategory (host, token, tokenType, categoryId, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/timelog_categories/${categoryId}/timelogs?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Get timelog record by ID.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} timelogId ID of timelog record
   * @param {Object} options Options
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   * @returns Promise object
   */
  GetTimelog (host, token, tokenType, timelogId, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/timelogs/${timelogId}?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Create timelog record for task.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} taskId ID of task
   * @param {Object} options Options
   *  @param {string} options.comment Timelog record comment
   *  @param {number} options.hours Time to log in hours
   *  @param {string} options.trackedDate Date to register time. Format: yyyy-MM-dd
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   *  @param {string} options.categoryId Timelog category
   * @returns Promise object
   */
  CreateTimelog (host, token, tokenType, taskId, options) {
    return request({
      method: 'POST',
      headers: {'Authorization': `${tokenType} ${token}`},
      body: this.optionsUriEncode(options),
      uri: `https://${host}/api/${ApiVer}/tasks/${taskId}/timelogs`
    })
  },

  /**
   * Update timelog by Id.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} timelogId ID of timelog record
   * @param {Object} options Options
   *  @param {string} options.comment Timelog record comment
   *  @param {number} options.hours Time to log in hours
   *  @param {string} options.trackedDate Date to register time. Format: yyyy-MM-dd
   *  @param {boolean} options.plainText Get comment text as plain text, HTML otherwise. Default: false
   *  @param {string} options.categoryId Timelog category
   * @returns Promise object
   */
  ModifyTimelog (host, token, tokenType, timelogId, options) {
    return request({
      method: 'PUT',
      headers: {'Authorization': `${tokenType} ${token}`},
      body: this.optionsUriEncode(options),
      uri: `https://${host}/api/${ApiVer}/timelogs/${timelogId}`
    })
  },

  /**
   * Delete Timelog record by ID.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} timelogId ID of timelog record
   * @returns Promise object
   */
  DeleteTimelog (host, token, tokenType, timelogId) {
    return request({
      method: 'DELETE',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/timelogs/${timelogId}`
    })
  },

  /**
   * Get timelog categories in account.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @returns Promise object
   */
  GetTimelogCategories (host, token, tokenType) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/timelog_categories`
    })
  },

  /**
   * Returns all Attachments of a folder.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} folderId ID of folder
   * @param {Object} options Options
   *  @param {boolean} options.versions Get attachments with previous versions
   *  @param {Object} options.createdDate Created date filter. Required to request attachments in account. Time range duration should be less than 31 day
   *    @param {string} options.createdDate.start Range start Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.createdDate.end Range end Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {boolean} options.withUrls Get attachment URLs
   * @returns Promise object
   */
  GetAttachmentsOfFolder (host, token, tokenType, folderId, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/folders/${folderId}/attachments?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Returns all Attachments of a task.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} taskId ID of task
   * @param {Object} options Options
   *  @param {boolean} options.versions Get attachments with previous versions
   *  @param {Object} options.createdDate Created date filter. Required to request attachments in account. Time range duration should be less than 31 day
   *    @param {string} options.createdDate.start Range start Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *    @param {string} options.createdDate.end Range end Format: yyyy-MM-dd'T'HH:mm:ss'Z'
   *  @param {boolean} options.withUrls Get attachment URLs
   * @returns Promise object
   */
  GetAttachmentsOfTask (host, token, tokenType, taskId, options) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/tasks/${taskId}/attachments?` + this.optionsUriEncode(options)
    })
  },

  /**
   * Returns attachment content. It can be accessed via /attachments/id/download/name.ext URL. In this case, 'name.ext' will be returned as the file name.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} attachmentId ID of attachment
   * @returns Promise object
   */
  DownloadAttacment (host, token, tokenType, attachmentId) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/attachments/${attachmentId}/download`
    })
  },

  /**
   * Public URL to attachment from Wrike or external service.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} attachmentId ID of attachment
   * @returns Promise object
   */
  GetAccessURLForAttachment (host, token, tokenType, attachmentId) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/attachments/${attachmentId}/url`
    })
  },

  /*
  curl -g -X POST -H 'Authorization: bearer <access_token>'
  -H 'X-Requested-With: XMLHttpRequest'
  -H 'X-File-Name: attachment.txt'
  -H 'content-type: application/octet-stream'
  --data-binary 'attachment content' 'https://www.wrike.com/api/v4/folders/IEAAAOH5I4AB7JFG/attachments'
  */

  CreateAttachmentForFolder (host, token, tokenType, folderId, file) {
    return request({
      method: 'POST',
      headers: {
        'Authorization': `${tokenType} ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
        'X-File-Name': file.name,
        'content-type': 'application/octet-stream'
      },
      body: file.data,
      uri: `https://${host}/api/${ApiVer}/folder/${folderId}/attachments`
    })
  },

  /**
   * Delete Attachment by ID.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @param {string} attachmentId ID of attachment
   * @returns Promise object
   */
  DeleteAttachment (host, token, tokenType, attachmentId) {
    return request({
      method: 'DELETE',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/attachments/${attachmentId}`
    })
  },

  /**
   * Get Workflows in accaunt.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @returns Promise object
   */
  GetWorkflows (host, token, tokenType) {
    return request({
      method: 'GET',
      headers: {
        'Authorization': `${tokenType} ${token}`
      },
      uri: `https://${host}/api/${ApiVer}/workflows`
    })
  },

  /**
   * Get Colors in accaunt.
   *
   * @param {string} host Wrike host
   * @param {string} token Access token
   * @param {string} tokenType Access token type
   * @returns Promise object
   */
  GetColors (host, token, tokenType) {
    return request({
      method: 'GET',
      headers: {'Authorization': `${tokenType} ${token}`},
      uri: `https://${host}/api/${ApiVer}/colors`
    })
  }
}

export default (store) => {
  store.subscribe((mutation) => {
    // nothing
  })
}
