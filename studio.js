import * as THREE from './three.module.js';
import m from './mithril.js';
import runtime from './runtime.js';
import Avatar from './avatars/avatars.js';
import {RigAux} from './rig-aux.js';
import {renderer, scene, camera, avatarScene} from './app-object.js';
import {getExt, unFrustumCull} from './util.js';

const zoom = 10;
const entityColors = {
  camera: '#5c6bc0',
  billboard: '#9ccc65',
  pass: '#ec407a',
  avatar: '#42a5f5',
  song: '#7e57c2',
  move: '#ffa726',
};
let app = null;
const entityHandlers = {
  camera(entity) {
    return {
      update(currentTime) {
        const factor = (currentTime - entity.startTime) / (entity.endTime - entity.startTime);
        if (factor >= 0 && factor <= 1) {
          camera.position.copy(entity.startPosition).lerp(entity.endPosition, factor);
          camera.quaternion.copy(entity.startQuaternion).slerp(entity.endQuaternion, factor);
        } else {
          camera.position.set(0, 0, 0);
          camera.quaternion.set(0, 0, 0, 1);
        }
      },
      stop() {
        // nothing
      },
      destroy() {
        // nothing
      },
    };
  },
  avatar(entity) {
    let o;
    let live = true;
    (async () => {
      const spec = await runtime.loadFile({
        url: entity.start_url,
        ext: getExt(entity.start_url),
      }, {
        contentId: entity.start_url,
      });
      if (live) {
        /* if (!spec.isVrm && spec.run) {
          spec.run();
        } */
        const avatar = new Avatar(spec.raw, {
          fingers: true,
          hair: true,
          visemes: true,
          debug: false,
        });
        avatar.model.isVrm = true;
        avatar.aux = new RigAux({
          rig: avatar,
          scene: avatarScene,
        });
        avatar.aux.rig = avatar;
        unFrustumCull(avatar.model);
        scene.add(avatar.model);
        
        o = avatar;
      }
    })();
    
    return {
      update(currentTime) {
        if (o) {
          const factor = (currentTime - entity.startTime) / (entity.endTime - entity.startTime);
          if (factor >= 0 && factor <= 1) {
            o.model.position.copy(entity.startPosition).lerp(entity.endPosition, factor);
            o.model.quaternion.copy(entity.startQuaternion).slerp(entity.endQuaternion, factor);
            o.model.visible = true;
          } else {
            o.model.position.set(0, 0, 0);
            o.model.quaternion.set(0, 0, 0, 1);
            o.model.visible = false;
          }
        }
      },
      stop() {
        // nothing
      },
      destroy() {
        if (o) {
          scene.remove(o.model);
        }
        live = false;
      },
    };
  },
  song(entity) {
    const audio = new Audio();
    audio.src = entity.start_url;
    audio.addEventListener('canplaythrough', () => {
      // console.log('audio load ok');
    });
    audio.addEventListener('error', err => {
      console.warn(err);
    });

    return {
      update(currentTime) {
        const innerTime = currentTime - entity.startTime;
        if (innerTime >= 0 && innerTime < audio.duration) {
          if (audio.paused) {
            audio.play();
            audio.currentTime = innerTime;
          }
        } else {
          if (!audio.paused) {
            audio.pause();
          }
        }
      },
      stop() {
        if (!audio.paused) {
          audio.pause();
        }
      },
      destroy() {
        // nothing
      },
    };
  },
  billboard(entity) {
    let o;
    let live = true;
    (async () => {
      o = await runtime.loadFile({
        url: entity.start_url,
        ext: getExt(entity.start_url),
      }, {
        contentId: entity.start_url,
      });
      if (live) {
        scene.add(o);
      }
    })();
    
    return {
      update(currentTime) {
        if (o) {
          const factor = (currentTime - entity.startTime) / (entity.endTime - entity.startTime);
          if (factor >= 0 && factor <= 1) {
            o.position.copy(entity.startPosition).lerp(entity.endPosition, factor);
            o.quaternion.copy(entity.startQuaternion).slerp(entity.endQuaternion, factor);
            o.visible = true;
          } else {
            o.position.set(0, 0, 0);
            o.quaternion.set(0, 0, 0, 1);
            o.visible = false;
          }
        }
      },
      stop() {
        // nothing
      },
      destroy() {
        if (o) {
          scene.remove(o);
        }
        live = false;
      },
    };
  },
  pass(entity) {
    let o;
    let live = true;
    (async () => {
      o = await runtime.loadFile({
        url: entity.start_url,
        ext: getExt(entity.start_url),
      }, {
        contentId: entity.start_url,
      });
      if (live) {
        scene.add(o);
      }
    })();
    
    return {
      update(currentTime) {
        if (o) {
          const factor = (currentTime - entity.startTime) / (entity.endTime - entity.startTime);
          if (factor >= 0 && factor <= 1) {
            // o.position.copy(entity.startPosition).lerp(o.endPosition, factor);
            // o.quaternion.copy(entity.startQuaternion).slerp(o.endQuaternion, factor);
            o.visible = true;
          } else {
            // o.position.set(0, 0, 0);
            // o.quaternion.set(0, 0, 0, 1);
            o.visible = false;
          }
        }
      },
      stop() {
        // nothing
      },
      destroy() {
        if (o) {
          scene.remove(o);
        }
        live = false;
      },
    };
  },
};

const _toTimeString = sec_num => {
  var minutes = Math.floor(sec_num / 60);
  var seconds = Math.floor(sec_num - (minutes * 60));
  var ms = Math.floor((sec_num - (minutes * 60) - seconds) * 100);

  if (minutes < 10) {minutes   = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  if (ms < 10) {ms = "0"+ms;}
  return minutes+':'+seconds+':'+ms;
};
const _getEventTime = e => {
  const playListEl = mithrilRoot.querySelector('.playlist');
  const box = playListEl.getBoundingClientRect();
  return (e.clientX - box.left) / zoom;
};
const _timeToPixels = t => t * zoom;

const Ruler = {
  view() {
    const lines = Array(100);
    for (let i = 0; i < lines.length; i++) {
      lines[i] = m('.tick' + ((i % 10 === 0) ? '.large' : ''), {
        style: {
          left: `${i * 20}px`,
          width: '${20}px',
        },
      });
    }
    return m('.ruler', lines);
  }
};

const Entity = {
  view(vnode) {
    return m('.entity', {
      class: vnode.attrs.selectedObject === vnode.attrs.entity ? 'selected' : '',
      style: {
        backgroundColor: entityColors[vnode.attrs.entity.type],
        left: `${_timeToPixels(vnode.attrs.entity.startTime)}px`,
        width: `${_timeToPixels(vnode.attrs.entity.endTime - vnode.attrs.entity.startTime)}px`,
      },
      onclick(e) {
        e.preventDefault();
        e.stopPropagation();
        vnode.attrs.selectObject(vnode.attrs.entity);
      },
      ondragover(e) {
        e.preventDefault();
      },
      ondrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const dataString = e.dataTransfer.getData('application/json');
        const data = JSON.parse(dataString);
        vnode.attrs.drop({
          data,
          time: _getEventTime(e) - vnode.attrs.entity.startTime,
        });
      },
    }, [
      m('.core', vnode.attrs.entity.type),
      m('.attributes', vnode.attrs.entity.attributes.map(attribute => m(Attribute, {
        selectedObject: vnode.attrs.selectedObject,
        entity: vnode.attrs.entity,
        attribute,
        selectObject: vnode.attrs.selectObject,
      }))),
    ]);
  },
};

const Attribute = {
  view(vnode) {
    return m('.attribute', {
      class: vnode.attrs.selectedObject === vnode.attrs.attribute ? 'selected' : '',
      style: {
        backgroundColor: entityColors[vnode.attrs.attribute.type],
        left: `${_timeToPixels(vnode.attrs.attribute.startTime)}px`,
        width: `${_timeToPixels(vnode.attrs.attribute.endTime - vnode.attrs.attribute.startTime)}px`,
      },
      onclick(e) {
        e.preventDefault();
        e.stopPropagation();
        vnode.attrs.selectObject(vnode.attrs.attribute);
      },
      ondblclick(e) {
        const time = _getEventTime(e) - vnode.attrs.entity.startTime - vnode.attrs.attribute.startTime;
        const nub = {
          type: 'inner',
          time,
        };
        vnode.attrs.attribute.nubs.push(nub);
        _render();
      },
    }, vnode.attrs.attribute.nubs.map(nub => m(Nub, {
      nub,
      selectedObject: vnode.attrs.selectedObject,
      selectObject: vnode.attrs.selectObject,
    })).concat([
      m('div', {
      }, vnode.attrs.attribute.type),
    ]));
  },
};

const Nub = {
  view(vnode) {
    let style;
    if (vnode.attrs.nub.type === 'inner') {
      style = {
        left: `${_timeToPixels(vnode.attrs.nub.time)}px`,
      };
    } else if (vnode.attrs.nub.type === 'start') {
      style = {
        left: 0,
      };
    } else if (vnode.attrs.nub.type === 'end') {
      style = {
        right: 0,
      };
    }
    
    return m('.nub', {
      class: vnode.attrs.selectedObject === vnode.attrs.nub ? 'selected' : '',
      style,
      onclick(e) {
        e.preventDefault();
        e.stopPropagation();
        vnode.attrs.selectObject(vnode.attrs.nub);
      },
    });
  },
};

const Track = {
  view(vnode) {
    const _dropAttribute = (entity, o) => {
      const {data: {type, length}, time} = o;
      const attribute = {
        type,
        startTime: time,
        endTime: time + length,
        nubs: [
          {
            type: 'start',
            time: 0,
          },
          {
            type: 'end',
            time: 0,
          },
        ],
      };
      entity.attributes.push(attribute);
      _render();
    };
    
    return m('.track', {
      ondragover(e) {
        e.preventDefault();
      },
      ondrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const dataString = e.dataTransfer.getData('application/json');
        const data = JSON.parse(dataString);
        vnode.attrs.drop({
          data,
          time: _getEventTime(e),
        });
      },
    }, m('.entities', vnode.attrs.entities.map(entity => m(Entity, {
      entity,
      selectedObject: vnode.attrs.selectedObject,
      selectObject: vnode.attrs.selectObject,
      drop(o) {
        _dropAttribute(entity, o);
      },
    }))));
  },
};

let rootInstance = null;
const _stopAllTracks = () => {
  for (const track of rootInstance.tracks) {
    track.stop();
  }
};
const Root = {
  oninit() {
    this.currentTime = 0;
    this.playing = false;
    const _makeTrack = () => ({
      entities: [],
      update(currentTime) {
        for (const entity of this.entities) {
          entity.update(currentTime);
        }
      },
      stop() {
        for (const entity of this.entities) {
          entity.stop();
        }
      },
    });
    this.tracks = [
      _makeTrack(),
      _makeTrack(),
      _makeTrack(),
    ];
    this.selectedObject = null;

    window.addEventListener('keydown', e => {
      switch (e.which) {
        case 27: { // esc
          this.selectedObject = null;
          _render();
          break;
        }
        case 32: { // space
          this.playing = !this.playing;
          if (!this.playing) {
            _stopAllTracks();
          }
          _render();
          break;
        }
        case 8: // backspace
        case 46: // delete
        {
          let changed = false;
          for (const track of this.tracks) {
            const index = track.entities.indexOf(this.selectedObject);
            if (index !== -1) {
              const entity = track.entities.splice(index, 1)[0];
              entity.destroy();
              this.selectedObject = null;
              changed = true;
            }
            
            for (const entity of track.entities) {
              const index = entity.attributes.indexOf(this.selectedObject);
              if (index !== -1) {
                entity.attributes.splice(index, 1);
                this.selectedObject = null;
                changed = true;
              }
              
              for (const attribute of entity.attributes) {
                const index = attribute.nubs.indexOf(this.selectedObject);
                if (index !== -1) {
                  attribute.nubs.splice(index, 1);
                  this.selectedObject = null;
                  changed = true;
                }
              }
            }
          }
          if (changed) {
            _render();
          }
          break;
        }
      }
    });
    
    rootInstance = this;
  },
  // To ensure the tag gets properly diffed on route change.
  // onbeforeupdate: init,
  update(timeDiff) {
    if (this.playing) {
      this.currentTime += timeDiff / 1000;
      _render();
      
      for (const track of this.tracks) {
        track.update(this.currentTime);
      }
    }
  },
  view() {
    const timeString = _toTimeString(this.currentTime);
    const _dropTrack = (track, o) => {
      const {data: {type, length, start_url, startPosition, endPosition, startQuaternion, endQuaternion}, time} = o;
      const entity = {
        type,
        start_url,
        startTime: time,
        endTime: time + length,
        attributes: [],
        startPosition: startPosition && new THREE.Vector3().fromArray(startPosition),
        endPosition: endPosition && new THREE.Vector3().fromArray(endPosition),
        startQuaternion: startQuaternion && new THREE.Quaternion().fromArray(startQuaternion),
        endQuaternion: endQuaternion && new THREE.Quaternion().fromArray(endQuaternion),
        update(currentTime) {
          instance && instance.update(currentTime);
        },
        stop() {
          instance && instance.stop();
        },
        destroy() {
          instance && instance.stop();
          instance && instance.destroy();
        },
      };
      track.entities.push(entity);

      const handler = entityHandlers[type];
      const instance = handler && handler(entity);

      _render();
    };

    return m(".studio", [
      m("footer", [
        m(".toolbar", [
          m(".buttons", [
            m(".button", {
              class: this.playing ? 'disabled' : '',
            }, [
              m("i.fa.fa-play", {
                onclick: e => {
                  this.playing = true;
                  _render();
                },
              }),
            ]),
            m(".button", {
              class: this.playing ? '' : 'disabled',
            }, [
              m("i.fa.fa-stop", {
                onclick: e => {
                  this.playing = false;
                  _stopAllTracks();
                  _render();
                },
              }),
            ]),
          ]),
          m("input", {
            type: 'text',
            value: timeString,
          }),
        ]),
        m(".core", [
          m(".playlist", {
            onclick: e => {
              e.preventDefault();
              e.stopPropagation();
              
              this.currentTime = _getEventTime(e);
              this.selectedObject = null;
              _stopAllTracks();
              _render();
            },
          }, [
            m(".needle", {
              style: {
                left: `${_timeToPixels(this.currentTime)}px`,
              },
            }),
            m(Ruler),
            m(".tracks", this.tracks.map(track => {
              return m(Track, {
                entities: track.entities,
                selectedObject: this.selectedObject,
                drop(o) {
                  _dropTrack(track, o);
                },
                selectObject: o => {
                  this.selectedObject = o;
                  _render();
                },
              });
            })),
          ]),
          m(".clips", [
            m(".clip", {
              style: {
                backgroundColor: entityColors.camera,
              },
              draggable: true,
              ondragstart(e) {
                e.dataTransfer.setData('application/json', JSON.stringify({
                  type: 'camera',
                  length: 10,
                  startPosition: new THREE.Vector3(0, 1, 1).toArray(),
                  endPosition: new THREE.Vector3(0, 2, 3).toArray(),
                  startQuaternion: new THREE.Quaternion(0, 0, 0, 1).toArray(),
                  endQuaternion: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI * 0.1).toArray(),
                }));
              },
            }, 'Camera'),
            m(".clip", {
              style: {
                backgroundColor: entityColors.billboard,
              },
              draggable: true,
              ondragstart(e) {
                e.dataTransfer.setData('application/json', JSON.stringify({
                  type: 'billboard',
                  length: 12,
                  start_url: './sakura/index.glbb',
                  startPosition: new THREE.Vector3(0, 0, -1).toArray(),
                  endPosition: new THREE.Vector3(0, 2, -1).toArray(),
                  startQuaternion: new THREE.Quaternion(0, 0, 0, 1).toArray(),
                  endQuaternion: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.2).toArray(),
                }));
              },
            }, 'Billboard'),
            m(".clip", {
              style: {
                backgroundColor: entityColors.pass,
              },
              draggable: true,
              ondragstart(e) {
                e.dataTransfer.setData('application/json', JSON.stringify({
                  type: 'pass',
                  length: 12,
                  start_url: './sakura/index.glfs',
                }));
              },
            }, 'Pass'),
            m(".clip", {
              style: {
                backgroundColor: entityColors.song,
              },
              draggable: true,
              ondragstart(e) {
                e.dataTransfer.setData('application/json', JSON.stringify({
                  type: 'song',
                  length: 30,
                  start_url: './assets2/song2.mp3',
                }));
              },
            }, 'Song'),
            m(".clip", {
              style: {
                backgroundColor: entityColors.avatar,
              },
              draggable: true,
              ondragstart(e) {
                e.dataTransfer.setData('application/json', JSON.stringify({
                  type: 'avatar',
                  length: 10,
                  start_url: './assets2/sacks3.vrm',
                  startPosition: new THREE.Vector3(0, 1.5, 0).toArray(),
                  endPosition: new THREE.Vector3(-1, 1.5, -1).toArray(),
                  startQuaternion: new THREE.Quaternion(0, 0, 0, 1).toArray(),
                  endQuaternion: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.2).toArray(),
                }));
              },
            }, 'Avatar'),
            m(".clip", {
              style: {
                backgroundColor: entityColors.move,
              },
              draggable: true,
              ondragstart(e) {
                e.dataTransfer.setData('application/json', JSON.stringify({
                  type: 'move',
                  length: 10,
                }));
              },
            }, 'Move'),
          ]),
        ]),
      ]),
    ]);
  },
};
const mithrilRoot = document.getElementById('mithril-root');
const _render = () => {
  m.render(mithrilRoot, m(Root));
};

const studio = {
  init(newApp) {
    app = newApp;
    _render();
  },
  update(timeDiff) {
    rootInstance.update(timeDiff);
  }
};
export default studio;