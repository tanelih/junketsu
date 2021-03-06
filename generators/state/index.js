'use strict'

var yo        = require('yeoman-generator')
var casing    = require('change-case')
var kebabCase = require('../../utils/kebab-case')

/**
 * Generate a project skeleton.
 */
module.exports = yo.Base.extend({

  prompting: function() {
    var self = this
    var done = this.async()

    var options = [
      {
        type:    'input',
        name:    'name',
        message: 'State name (PascalCase)',
      },
      {
        type:    'list',
        name:    'type',
        message: 'State type (initial)',
        choices: [ 'Array', 'Object', 'String', 'Number' ],
      },
      {
        type:    'input',
        name:    'actions',
        message: 'State actions (camelCase)',
      },
    ]

    this.prompt(options, function(props) {
      var initialState = {
        'Array':  '[ ]',
        'Object': '{ }',
        'String': '\'\'',
        'Number': '0',
      }
      var tsMapping = {
        'Array':  'Array<any>',
        'Object': 'Object',
        'String': 'string',
        'Number': 'number',
      }
      self.props = {
        actions: props.actions.split(',').map(function(action) {
          // by default, actions are 'sync'
          var async = false

          // check if the action should be 'async', actions with the '*'-affix
          // are treated as 'async' actions, note that we remove the '*' here
          var action = (function(action) {
            if(action.slice(-1) === '*') {
              async = true
              return action.slice(0, -1)
            }
            return action
          })(action.trim())

          // deduce the 'constant' type for the action, e.g. 'DO_SOMETHING'
          var type = casing.constantCase(action.trim())

          return { async: async, creator: action, constant: type }
        }),
        name:             kebabCase(props.name.trim()),
        initialState:     initialState[props.type],
        initialStateType: tsMapping[props.type],
      }
      return done()
    })
  },

  writing: function() {
    var actionPath  = 'src/app/actions/'  + this.props.name + '.ts'
    var reducerPath = 'src/app/reducers/' + this.props.name + '.ts'

    var self = this
    var copy = function(template, destination) {
      self.fs.copyTpl(
        self.templatePath(template),
        self.destinationPath(destination),
        self.props
      )
    }

    copy('new-action.ts.erb',  actionPath)
    copy('new-reducer.ts.erb', reducerPath)
  }
})
