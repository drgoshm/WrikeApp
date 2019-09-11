import {Api} from '../plugins/api'

export default {
  state: {
    Workflows: [],
    Folders: {},
    Tasks: {},
    Opened: [],
    CurrentFolder: undefined
  },
  mutations: {
    UPDATE_WORKFLOWS (state, data) {
      state.Workflows = data // mergeDeep(state.Workflows, data)
      console.log(state.Workflows)
    },
    UPDATE_FOLDERS (state, data) {
      for (let index in data) {
        if (data[index].title === 'Root') {
          state.Folders['Root'] = data[index]
        } else if (data[index].title === 'Recycle Bin') {
          state.Folders['RecycleBin'] = data[index]
        } else {
          state.Folders[data[index].id] = data[index]
        }
      }
    },
    SET_CURRENT_FOLDER (state, id) {
      state.CurrentFolder = id
    },
    OPEN_NEW_TAB (state, tabData) {
      state.OpenedTabs.push(tabData)
    },
    UPDATE_TASKS (state, data) {
      for (let index in data) {
        state.Tasks[data[index].id] = data[index]
      }
    }
  },
  getters: {
    rootList (state) {
      return state.Folders.Root ? state.Folders.Root.childIds : []
    },
    recycleBinList (state) {
      return state.Folders.RecycleBin ? state.Folders.RecycleBin.childIds : []
    },
    tasksByCurrentFolder (state) {
      let _tasks = []
      for (let id in state.Tasks) {
        if (state.Tasks[id].parentIds.indexOf(state.CurrentFolder) >= 0) _tasks.push(id)
      }
      return _tasks
    },
    taskList ({Tasks}, filter) {
      const _filter = filter || {}
      let _tasks = []
      for (let id in Tasks) {
        if (_filter.hasOwnProperty('folderId')) {
          if (!Tasks[id].folderIds.contains(_filter.folderId)) continue
        }
        _tasks.push(id)
      }
      return _tasks
    }
  },
  actions: {
    getWorkflows ({commit, dispatch, rootState}) {
      const startTime = Date.now()
      return new Promise((resolve, reject) => {
        dispatch('refresh_token').then(() => {
          Api.GetWorkflows(rootState.OAuth.Host, rootState.OAuth.AccessToken, rootState.OAuth.TokenType)
            .then((response) => {
              commit('UPDATE_WORKFLOWS', JSON.parse(response).data)
              console.log('Time to responce: ' + (Date.now() - startTime)) // FIXME: Debug log
              resolve()
            })
            .catch((err) => { reject(err) })
        })
          .catch((err) => { reject(err) })
      })
    },
    getFolders ({commit, dispatch, rootState}) {
      return new Promise((resolve, reject) => {
        dispatch('refresh_token').then(() => {
          Api.GetProjectsAndFolders(rootState.OAuth.Host, rootState.OAuth.AccessToken, rootState.OAuth.TokenType, false,
            {fields: ['color', 'childIds']})
            .then((response) => {
              commit('UPDATE_FOLDERS', JSON.parse(response).data)
              resolve()
            })
            .catch((err) => { console.log(arguments); reject(err) }) // FIXME: Debug log
        })
          .catch((err) => { reject(err) })
      })
    },
    getTasks ({commit, dispatch, rootState}, folderId) {
      const startTime = Date.now()
      return new Promise((resolve, reject) => {
        dispatch('refresh_token').then(() => {
          Api.GetTasks(rootState.OAuth.Host, rootState.OAuth.AccessToken, rootState.OAuth.TokenType, folderId, {
            fields: ['description', 'parentIds', 'responsibleIds', 'superTaskIds', 'attachmentCount', 'dependencyIds', 'authorIds', 'sharedIds', 'recurrent', 'subTaskIds', 'customFields', 'hasAttachments', 'metadata', 'briefDescription', 'superParentIds']
          })
            .then((response) => {
              commit('UPDATE_TASKS', JSON.parse(response).data)
              console.log('Time to responce: ' + (Date.now() - startTime))
              resolve()
            })
            .catch(err => { reject(err) })
        })
          .catch(err => { reject(err) })
      })
    },
    test () {
      Api.CreateGroup('', '', '')
    }
  }
}
