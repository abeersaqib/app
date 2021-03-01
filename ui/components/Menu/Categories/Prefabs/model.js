import Model from '../model.js';

const image = './assets/logo-flat.png';

const items = [
  {
    image,
    name: 'home',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/home/manifest.json',
  },
  {
    image,
    name: 'mirror',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/mirror/index.js',
  },
  {
    image,
    name: 'lightsaber',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/lightsaber/index.js',
  },
  {
    image,
    name: 'shield',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/shield/index.js',
  },
  {
    image,
    name: 'physicscube',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/physicscube/index.js',
  },
  {
    image,
    name: 'weapons',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/weapons/index.js',
  },
  {
    image,
    name: 'hookshot',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/hookshot/index.js',
  },
  {
    image,
    name: 'voxels',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/voxels/index.js',
  },
  {
    image,
    name: 'cv',
    details: '',
    icon: image,
    filename: 'cv.url',
    content: 'https://cv.webaverse.com/',
  },
  {
    image,
    name: 'dcl',
    details: '',
    icon: image,
    filename: 'cv.url',
    content: 'https://dcl.webaverse.com/',
  },
  {
    image,
    name: 'h',
    details: '',
    icon: image,
    filename: 'h.url',
    content: 'https://h.webaverse.com/',
  },
  {
    image,
    name: 'land',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/land/index.js',
  },
  {
    image,
    name: 'planet',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/planet/index.js',
  },
  {
    image,
    name: 'camera',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/camera/index.js',
  },
  {
    image,
    name: 'cat-in-hat',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/cat-in-hat/manifest.json',
  },
  {
    image,
    name: 'sword',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/sword/manifest.json',
  },
  {
    image,
    name: 'dragon-pet',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/dragon-pet/manifest.json',
  },
  {
    image,
    name: 'dragon-mount',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/dragon-mount/manifest.json',
  },
  {
    image,
    name: 'dragon-fly',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/dragon-fly/manifest.json',
  },
  {
    image,
    name: 'pistol',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/pistol/manifest.json',
  },
  {
    image,
    name: 'rifle',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/rifle/manifest.json',
  },
  {
    image,
    name: 'pickaxe',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/pickaxe/manifest.json',
  },
  {
    image,
    name: 'hoverboard',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/hoverboard/manifest.json',
  },
  {
    image,
    name: 'hovercraft',
    details: '',
    icon: image,
    start_url: 'https://avaer.github.io/hovercraft/manifest.json',
  },
  {
    image,
    name: 'cityscape',
    details: '',
    icon: image,
    start_url: 'https://raw.githubusercontent.com/metavly/cityscape/master/manifest.json',
  },
];

export default new Model({items});