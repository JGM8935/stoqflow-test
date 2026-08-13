import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { MessagesCollection } from '../imports/api/messages.js'

import './main.html';

// -- Body Template --
Template.body.helpers({
  currentUser() {
    return Session.get('currentUser');
  },
});


// -- Login Template --
Template.login.helpers({
  currentUser(){
    return Session.get('currentUser');
  },
});

Template.login.events({
  'click #login-button'(event, template){
    const selected = template.find('#user-select').value;
    if(selected){
      Session.set('currentUser', selected);
    }
  },
  'click #logout-button'(event){
    Session.set('currentUser', null);
  },
});
