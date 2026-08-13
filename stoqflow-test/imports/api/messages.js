import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const MessagesCollection = new Mongo.Collection('messages');

if(Meteor.isServer){
    Meteor.publish('messages', function publishMessages(currentUser) {
        return MessagesCollection.find({$or: [{from: currentUser}, {to: currentUser}]});
    })
};

Meteor.methods({
    async 'messages.insert'(from, to, text){
        if(from === 'userone' || from === 'usertwo'){
            to = 'receiver';
            await MessagesCollection.insertAsync({from: from, to: to, text: text});
        }
        else if (from === 'receiver'){
            if(to === "userone" || to === "usertwo"){
                await MessagesCollection.insertAsync({from: from, to: to, text: text});
            }
            else {
                throw new Meteor.Error("Unknow-user", "Unkown user");
            }
        }
        else {
            throw new Meteor.Error("Unkown-user","Unknown user");
        }
    }
});