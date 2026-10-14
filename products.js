// ====================== YOUR IMAGES: change the paths here ======================
// Put your photos in the  folder, then edit the file names below. Square photos, about 1200 x 1200 px,
// JPG or WebP under 200 KB each, load fastest. If a file is missing, a grey placeholder picture shows instead.
// Home page pictures (hero1-hero4 are the four tiles at the top, feature is the large photo further down):
const SITE_IMAGES = {
  hero1: 'home-hero-1.jpg',
  hero2: 'home-hero-2.jpg',
  hero3: 'home-hero-3.jpg',
  hero4: 'home-hero-4.jpg',
  feature: 'home-feature.jpg'
};
// Product pictures: edit the  image:  value on each product below.
// For a gallery on the product page, add  images: ['a.jpg','b.jpg','c.jpg']  to a product (first one is the main photo).
// ================================================================================

// DESKOBS | product data.
// EDIT THESE to match your real products:
//   stock   : units available (0 = shows "Out of stock", 1-5 = shows "Only N left")
//   specs   : rows for the "Details" table on the product page
//   points  : 2-3 short selling points shown under the description
//   pairs   : ids of products that go well with this one ("Complete your setup")
//   images  : OPTIONAL. Add 2+ image paths and a thumbnail gallery appears automatically.
// Home page "Featured": product ids shown there, in this order. Change them to feature other products.
const FEATURED = [1, 9, 3, 6, 11, 4, 2, 10];

const PRODUCTS = [
 {id:1,name:'Felt Desk Mat',category:'desk',price:1499,rating:4.6,color:'#8d9aa6',image:'felt-desk-mat.jpg',description:'Wool felt mat, 80x40 cm. Soft grip and a quiet mouse surface.',
  stock:24,points:['Quiet, smooth mouse surface','Soft grip so it stays put'],specs:[['Size','80 x 40 cm'],['Material','Wool felt']],pairs:[6,2]},
 {id:2,name:'Desk Organizer Tray',category:'desk',price:799,rating:4.3,color:'#c9a98a',image:'desk-organizer-tray.jpg',description:'Holds pens, cards and cables. Powder coated steel.',
  stock:18,points:['One place for pens, cards and cables'],specs:[['Material','Powder coated steel'],['Holds','Pens, cards, cables']],pairs:[1,5]},
 {id:16,name:'Drawer Organizer Insert',category:'desk',price:1299,rating:4.4,color:'#3a3d44',image:'drawer-organizer.jpg',description:'Felt-lined insert with separate compartments for pens, earphones, cards and cables.',
  stock:13,points:['A place for every small thing','Soft felt lining protects your items'],specs:[['Material','Felt'],['Compartments','Several, for pens, cards, earphones and cables']],pairs:[1,2]},
 {id:17,name:'Wooden Desk Tray',category:'desk',price:1899,rating:4.6,color:'#d9a66b',image:'wood-desk-tray.jpg',description:'Wooden tray with shaped slots for your watch, pens, notes, earphones and phone.',
  stock:7,points:['Everything you carry, lined up in one place','Warm wood finish'],specs:[['Material','Wood'],['Holds','Watch, pens, notes, earphones, phone']],pairs:[2,5]},
 {id:9,name:'Task Lamp',category:'light',price:2299,rating:4.7,color:'#f2cc8f',image:'task-lamp.jpg',description:'Dimmable, 3 colour temperatures, flicker free for long work hours.',
  stock:9,points:['Dimmable, 3 colour temperatures','Flicker free for long work hours'],specs:[['Dimming','Yes'],['Colour temperatures','3'],['Flicker','Flicker free']],pairs:[1,3]},
 {id:10,name:'Moon Night Lamp',category:'light',price:1799,rating:4.5,color:'#9db4c0',image:'moon-night-lamp.jpg',description:'Soft rechargeable glow. Tap to change brightness.',
  stock:14,points:['Soft glow, tap to change brightness'],specs:[['Power','Rechargeable'],['Control','Tap']],pairs:[9,2]},
 {id:3,name:'Aluminium Laptop Stand',category:'tech',price:2499,rating:4.8,color:'#b9bcc0',image:'laptop-stand.jpg',images:['laptop-stand.jpg','laptop-stand-2.jpg'],description:'Raises your screen to eye level. Folds flat, fits 11 to 16 inch laptops.',
  stock:3,points:['Screen at eye level for better posture','Folds flat to carry'],specs:[['Material','Aluminium'],['Fits','11 to 16 inch laptops'],['Folds','Yes, flat']],pairs:[6,7]},
 {id:4,name:'Phone Stand',category:'tech',price:699,rating:4.4,color:'#e4572e',image:'phone-stand.jpg',description:'Adjustable angle, non slip base. Works with any phone.',
  stock:30,points:['Adjustable viewing angle','Non slip base'],specs:[['Angle','Adjustable'],['Works with','Any phone']],pairs:[7,9]},
 {id:15,name:'Wireless Charging Stand',category:'tech',price:1799,rating:4.5,color:'#2f3437',image:'wireless-charger-stand.jpg',description:'Holds your phone upright while it charges. For phones that support wireless charging.',
  stock:11,points:['Phone stays upright and easy to read','Charges without plugging in a cable'],specs:[['Type','Wireless charging stand'],['Works with','Wireless-charging phones']],pairs:[9,7]},
 {id:12,name:'Phone Cover',category:'tech',price:599,rating:4.0,color:'#bc4749',image:'phone-cover.jpg',description:'Slim shock absorbing cover in matte colours.',
  stock:15,points:['Slim and shock absorbing'],specs:[['Finish','Matte'],['Protection','Shock absorbing']],pairs:[4,7]},
 {id:5,name:'Earphone Stand',category:'tech',price:599,rating:4.2,color:'#3d5a80',image:'earphone-stand.jpg',description:'Keeps earphones and headphones tidy and off the desk.',
  stock:15,points:['Keeps earphones and headphones off the desk'],specs:[['Holds','Earphones and headphones']],pairs:[2,3]},
 {id:6,name:'Silent Wireless Mouse',category:'tech',price:1299,rating:4.5,color:'#2b2d42',image:'silent-wireless-mouse.jpg',description:'Quiet clicks, USB-C rechargeable, 3 device pairing.',
  stock:22,points:['Quiet clicks','Switch between 3 devices'],specs:[['Charging','USB-C rechargeable'],['Pairing','Up to 3 devices'],['Clicks','Silent']],pairs:[1,3]},
 {id:13,name:'Ergonomic Mouse',category:'tech',price:999,rating:4.3,color:'#c1121f',image:'red-mouse.jpg',description:'Contoured grip with a scroll wheel and side buttons. Red and black finish.',
  stock:16,points:['Contoured shape for long work days','Side buttons within thumb reach'],specs:[['Finish','Red and black'],['Buttons','Scroll wheel and side buttons']],pairs:[1,3]},
 {id:14,name:'Compact Grey Mouse',category:'tech',price:849,rating:4.1,color:'#8a8d91',image:'grey-mouse.jpg',description:'Small, comfortable shape with a textured side grip. Easy to carry in a bag.',
  stock:20,points:['Compact enough to travel with','Textured grip on the sides'],specs:[['Finish','Grey and black'],['Size','Compact']],pairs:[1,6]},
 {id:7,name:'65W GaN Charger',category:'tech',price:1999,rating:4.7,color:'#f2f2f0',image:'gan-charger.jpg',description:'Charges a laptop and a phone together. Compact folding plug.',
  stock:12,points:['Charges a laptop and a phone together','Folding plug fits in a pocket'],specs:[['Power','65W'],['Type','GaN'],['Plug','Folding']],pairs:[8,3]},
 {id:8,name:'Connector Pack',category:'tech',price:499,rating:4.1,color:'#6a994e',image:'connector-pack.jpg',description:'USB-C to USB-A, HDMI and Lightning adapters in four colours.',
  stock:40,points:['USB-C to USB-A, HDMI and Lightning'],specs:[['Includes','USB-C to USB-A, HDMI, Lightning'],['Colours','4']],pairs:[7,3]},
 {id:11,name:'Everyday Carry Bag',category:'carry',price:2199,rating:4.6,color:'#33415c',image:'carry-bag.jpg',description:'Water resistant, padded laptop pocket, 18 litre.',
  stock:8,points:['Water resistant','Padded laptop pocket'],specs:[['Capacity','18 litre'],['Water resistance','Yes'],['Laptop pocket','Padded']],pairs:[3,7]}
];
