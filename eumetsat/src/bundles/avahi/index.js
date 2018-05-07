/** avahi.js
 *
 * Forked by fabic.net on 2018-05-07.
 *
 * Original work by nuxlli :
 *
 *   https://gist.github.com/nuxlli/7d82ab7ac3e0072c5faf
 *
 * References:
 *   http://www.avahi.org/wiki/Examples/PythonPublishAlias
 *   https://github.com/airtonix/avahi-aliases
 *   http://code.metager.de/source/xref/freedesktop/avahi/avahi-python/avahi/__init__.py
 *
 * See also:
 *   - https://github.com/george-hawkins/avahi-aliases-notes
 *   - ^ via: https://unix.stackexchange.com/a/346944
 */

'use strict'

import _ from "lodash";
import dbusp from 'dbus-as-promised'
import dbus from "dbus-native";
import {toASCII} from "punycode";

var bus     = dbus.systemBus();

var namespace = 'org.freedesktop.Avahi'

var Avahi = {
  DBUS_NAME: namespace,
  DBUS_PATH_SERVER: '/',
  DBUS_INTERFACE_SERVER: namespace + '.Server',
  DBUS_INTERFACE_ENTRY_GROUP: namespace + '.EntryGroup',
  IF_UNSPEC: -1,
  PROTO_UNSPEC: -1,
}

var Settings = {
  TTL: 60,
  CLASS_IN: 0x01,
  TYPE_CNAME: 0x05,
}

function encode(name) {
  return _.map(name.split('.'), function(p) {
    return toASCII(p);
  }).join('.');
}

function encode_rdata(rdata) {
  return _.map(rdata.split('.'), function(p) {
    p = toASCII(p);
    return String.fromCharCode(p.length) + p
  }).join('') + '\0';
}

function string_to_byte_array(data) {
  return _.reduce(data.split(''), function(data, p) {
    data.push(p.charCodeAt(0) & 0xFF);
    return data;
  }, []);
}

function publish(cname) {
  const service = bus.getService(Avahi.DBUS_NAME)

  service.getInterface(
    Avahi.DBUS_PATH_SERVER,
    Avahi.DBUS_INTERFACE_SERVER,
    function(err, server) {
      if (err) { throw new Error("Error in getInterface: " + err); }

      server.EntryGroupNew(function(err, entry_group) {
        if (err) { throw new Error("Error in EntryGroupNew: " + err); }

        service.getObject(entry_group, function(err, obj) {
          if (err) { throw new Error("Error in getObject: " + err);}

          var group = obj.as(Avahi.DBUS_INTERFACE_ENTRY_GROUP);
          server.GetHostNameFqdn(function(err, rdata) {
            if (err) { throw new Error("Error in GetHostNameFqdn: " + err);}

            // Encode data to send
            cname = encode(cname);
            rdata = encode_rdata(rdata);
            rdata = string_to_byte_array(rdata);

            // Register a alias
            console.log("adding %s", cname);
            group.AddRecord(Avahi.IF_UNSPEC, Avahi.PROTO_UNSPEC, 0, cname, Settings.CLASS_IN, Settings.TYPE_CNAME, Settings.TTL, rdata, function(err, result) {
              if (err) { throw new Error("Error in AddRecord: " + err);}
              group.Commit(function(err, result) {
                if (err) { throw new Error("Error in Commit: " + err);}
              });
            });
          });

        });

      });
    });
}

publish('dude.local');
publish('one.dude.local');
publish('another.dude.local');
