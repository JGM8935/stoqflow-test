import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
import { MessagesCollection } from '../imports/api/messages.js';

if(Meteor.isServer) {
    describe('messages', () => {
        beforeEach( async () => {
            await MessagesCollection.removeAsync({});
        });

        describe('messages.insert', () => {
            it('laat userone een bericht sturen naar receiver', async () => {
                await Meteor.callAsync('messages.insert', 'userone', 'ignored', 'hallo');

                const message = await MessagesCollection.findOneAsync({from: 'userone'});
                assert.isDefined(message);
                assert.equal(message.to, 'receiver');
                assert.equal(message.text, 'hallo');
            });

            it('laat usertwo een bericht sturen naar receiver', async () => {
                await Meteor.callAsync('messages.insert', 'usertwo', 'ignored', 'hoi');

                const message = await MessagesCollection.findOneAsync({ from: 'usertwo' });
                assert.isDefined(message);
                assert.equal(message.to, 'receiver');
            });

            it('laat receiver antwoorden naar userone', async () => {
                await Meteor.callAsync('messages.insert', 'receiver', 'userone', 'antwoord');

                const message = await MessagesCollection.findOneAsync({ from: 'receiver', to: 'userone' });
                assert.isDefined(message);
                assert.equal(message.text, 'antwoord');
            });

            it('laat receiver antwoorden naar usertwo', async () => {
                await Meteor.callAsync('messages.insert', 'receiver', 'usertwo', 'antwoord2');

                const message = await MessagesCollection.findOneAsync({ from: 'receiver', to: 'usertwo' });
                assert.isDefined(message);
            });

            it('gooit een fout als receiver naar een onbekende gebruiker stuurt', async () => {
                try {
                    await Meteor.callAsync('messages.insert', 'receiver', 'onbekend', 'test');
                    assert.fail('had een error moeten gooien');
                } catch (err) {
                    assert.equal(err.error, 'Unknow-user');
                }   
            });

            it('gooit een fout als "from" een onbekende gebruiker is', async () => {
                try {
                    await Meteor.callAsync('messages.insert', 'hacker', 'userone', 'test');
                    assert.fail('had een error moeten gooien');
                } catch (err) {
                    assert.equal(err.error, 'Unkown-user');
                }
            });

            it('laat userone niet rechtstreeks naar usertwo sturen (to wordt overschreven naar receiver)', async () => {
                await Meteor.callAsync('messages.insert', 'userone', 'usertwo', 'stiekem bericht');

                const message = await MessagesCollection.findOneAsync({ from: 'userone' });
                assert.isDefined(message);
                assert.notEqual(message.to, 'usertwo');
                assert.equal(message.to, 'receiver');
            });

            it('laat usertwo niet rechtstreeks naar userone sturen (to wordt overschreven naar receiver)', async () => {
                await Meteor.callAsync('messages.insert', 'usertwo', 'userone', 'ander stiekem bericht');

                const message = await MessagesCollection.findOneAsync({ from: 'usertwo' });
                assert.isDefined(message);
                assert.notEqual(message.to, 'userone');
                assert.equal(message.to, 'receiver');
            });
        });

        describe('messages publicatie', () => {
            it('publiceert enkel berichten van/naar de opgegeven gebruiker', async () => {
                await MessagesCollection.insertAsync({ from: 'userone', to: 'receiver', text: 'a' });
                await MessagesCollection.insertAsync({ from: 'receiver', to: 'userone', text: 'b' });
                await MessagesCollection.insertAsync({ from: 'usertwo', to: 'receiver', text: 'c' });

                const cursor = MessagesCollection.find({$or: [{ from: 'userone' }, { to: 'userone' }],});
                const count = await cursor.countAsync();
                assert.equal(count, 2);
            });
        });
    });
}