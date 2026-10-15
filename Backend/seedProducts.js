// Seed ~1000 varied products into the local E-comm database.
// Usage: node seedProducts.js
// Uses picsum.photos seeded URLs for images (no API key needed).
import 'dotenv/config';
import mongoose from 'mongoose';
import productModel from './models/productModel.js';

// ---------- deterministic RNG ----------
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261015);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickN = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
};

// ---------- shared vocab ----------
const COLORS = [
  'Navy', 'Black', 'White', 'Olive', 'Burgundy', 'Mustard', 'Teal', 'Coral',
  'Forest Green', 'Charcoal', 'Beige', 'Denim Blue', 'Blush Pink', 'Rust',
  'Cream', 'Slate Grey', 'Maroon', 'Sky Blue', 'Lavender', 'Khaki',
];
const FITS_TOP = ['Classic-Fit', 'Slim-Fit', 'Relaxed-Fit', 'Oversized', 'Tailored', 'Regular-Fit'];
const FITS_BOTTOM = ['Slim-Fit', 'Straight-Leg', 'Relaxed-Fit', 'High-Rise', 'Tapered', 'Wide-Leg'];
const PATTERNS = ['Solid', 'Striped', 'Checked', 'Printed', 'Embroidered', 'Color-Block', 'Textured', 'Washed'];
const FABRICS_TOP = [
  'breathable 100% cotton', 'soft cotton-blend jersey', 'premium combed cotton',
  'lightweight linen-blend', 'smooth modal fabric', 'brushed twill', 'airy rayon',
];
const FABRICS_BOTTOM = [
  'stretch denim', 'durable cotton twill', 'soft brushed corduroy', 'breathable linen-blend',
  'flex-stretch chino fabric', 'heavyweight canvas', 'smooth sateen',
];
const FABRICS_WINTER = [
  'insulating recycled polyester fill', 'cozy wool-blend', 'plush fleece',
  'water-resistant nylon shell with warm padding', 'soft cashmere-touch knit',
  'double-layered thermal knit', 'windproof softshell',
];
const OCCASIONS = [
  'Perfect for everyday wear, weekends and casual outings.',
  'Dresses up or down effortlessly for work or dinner.',
  'A versatile staple for layering through the seasons.',
  'Ideal for travel, college days and evening hangouts.',
  'Pairs well with sneakers for a street-ready look or with boots for a sharper outfit.',
];
const CARE = [
  'Machine washable and resistant to fading after repeated washes.',
  'Easy to care for — machine wash cold and tumble dry low.',
  'Retains its shape and color wash after wash.',
  'Pre-shrunk fabric ensures a consistent fit over time.',
];
const DETAILS_TOP = [
  'Features reinforced stitching, a comfortable neckline and a tag-free label for all-day comfort.',
  'Cut with a modern silhouette, side vents for movement and a clean, minimal finish.',
  'Designed with set-in sleeves, a curved hem and double-needle hems for durability.',
];
const DETAILS_BOTTOM = [
  'Features a secure zip fly, deep pockets and reinforced belt loops.',
  'Designed with an elasticated comfort waistband and roomy side pockets.',
  'Cut for ease of movement with a gusseted crotch and bartacked stress points.',
];
const DETAILS_WINTER = [
  'Features a cozy high collar, secure zip pockets and ribbed cuffs that lock in warmth.',
  'Designed with a quilted lining, storm placket and adjustable hood for cold-weather protection.',
  'Finished with premium buttons, a soft inner lining and side vents for easy layering.',
];

const GROUPS = {
  'Men|Topwear': {
    items: ['Oxford Shirt', 'Flannel Shirt', 'Polo T-Shirt', 'Crew-Neck T-Shirt', 'Henley Shirt', 'Linen Shirt', 'Denim Shirt', 'Graphic Tee', 'V-Neck Tee', 'Chambray Shirt', 'Rugby Shirt', 'Cuban Collar Shirt', 'Pique Polo', 'Thermal Long-Sleeve Tee'],
    fits: FITS_TOP, fabrics: FABRICS_TOP, details: DETAILS_TOP, priceMin: 20, priceMax: 90,
  },
  'Men|Bottomwear': {
    items: ['Slim-Fit Jeans', 'Straight-Leg Jeans', 'Chino Trousers', 'Cargo Pants', 'Corduroy Trousers', 'Linen Trousers', 'Jogger Pants', 'Denim Shorts', 'Chino Shorts', 'Pleated Trousers', 'Wool-Blend Trousers', 'Drawstring Trousers'],
    fits: FITS_BOTTOM, fabrics: FABRICS_BOTTOM, details: DETAILS_BOTTOM, priceMin: 30, priceMax: 120,
  },
  'Men|Winterwear': {
    items: ['Puffer Jacket', 'Wool Overcoat', 'Parka', 'Fleece Jacket', 'Quilted Vest', 'Shearling Jacket', 'Trench Coat', 'Down Jacket', 'Hooded Sweatshirt', 'Cable-Knit Sweater', 'Turtleneck Sweater', 'Wool Peacoat'],
    fits: FITS_TOP, fabrics: FABRICS_WINTER, details: DETAILS_WINTER, priceMin: 50, priceMax: 200,
  },
  'Women|Topwear': {
    items: ['Wrap Top', 'Peplum Top', 'Ribbed Tank Top', 'Boho Blouse', 'Silk Shirt', 'Tunic Top', 'Lace-Trim Camisole', 'Summer Dress', 'Maxi Dress', 'Crop Top', 'Smocked Blouse', 'Knit Polo Top'],
    fits: FITS_TOP, fabrics: FABRICS_TOP, details: DETAILS_TOP, priceMin: 20, priceMax: 95,
  },
  'Women|Bottomwear': {
    items: ['High-Rise Jeans', 'Mom Jeans', 'Wide-Leg Trousers', 'Pleated Skirt', 'Denim Skirt', 'Midi Skirt', 'Palazzo Pants', 'Linen Pants', 'Leggings', 'Culottes', 'Paperbag-Waist Trousers', 'Maxi Skirt'],
    fits: FITS_BOTTOM, fabrics: FABRICS_BOTTOM, details: DETAILS_BOTTOM, priceMin: 28, priceMax: 115,
  },
  'Women|Winterwear': {
    items: ['Wool Coat', 'Faux-Fur Jacket', 'Longline Blazer', 'Puffer Coat', 'Cashmere-Blend Sweater', 'Chunky Cardigan', 'Faux-Leather Jacket', 'Teddy Coat', 'Quilted Jacket', 'Knit Poncho', 'Hooded Parka', 'Turtleneck Sweater Dress'],
    fits: FITS_TOP, fabrics: FABRICS_WINTER, details: DETAILS_WINTER, priceMin: 55, priceMax: 210,
  },
  'Kids|Topwear': {
    items: ['Graphic Tee', 'Striped T-Shirt', 'Polo Shirt', 'Denim Shirt', 'Party Dress', 'Floral Top', 'School Shirt', 'Cartoon-Print Tee', 'Sleeveless Top', 'Ruffle-Sleeve Top', 'Dinosaur-Print Tee', 'Rainbow Tee'],
    fits: FITS_TOP, fabrics: FABRICS_TOP, details: DETAILS_TOP, priceMin: 12, priceMax: 45,
  },
  'Kids|Bottomwear': {
    items: ['Denim Jeans', 'Cargo Shorts', 'Jogger Pants', 'School Trousers', 'Denim Shorts', 'Skater Skirt', 'Leggings', 'Chino Shorts', 'Dungarees', 'Printed Pyjama Pants', 'Pleated School Skirt', 'Track Pants'],
    fits: FITS_BOTTOM, fabrics: FABRICS_BOTTOM, details: DETAILS_BOTTOM, priceMin: 15, priceMax: 55,
  },
  'Kids|Winterwear': {
    items: ['Padded Jacket', 'Fleece Hoodie', 'Knit Sweater', 'Puffer Vest', 'Wool Cardigan', 'Fleece-Lined Denim Jacket', 'Snow Jacket', 'Animal-Ear Hoodie', 'Quilted Coat', 'Cozy Sweatshirt', 'Thermal Set', 'Rain Jacket'],
    fits: FITS_TOP, fabrics: FABRICS_WINTER, details: DETAILS_WINTER, priceMin: 25, priceMax: 90,
  },
};

const POOL_SIZE = 150;
const imgUrl = (n) => `http://localhost:5000/uploads/products/p${n}.jpg`;
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function poolImages(key) {
  const h = hashStr(key);
  return [
    imgUrl((h % POOL_SIZE) + 1),
    imgUrl(((h + 47) % POOL_SIZE) + 1),
    imgUrl(((h + 94) % POOL_SIZE) + 1),
  ];
}

const ADULT_TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const ADULT_BOTTOM_SIZES = ['28', '30', '32', '34', '36', '38'];
const KIDS_TOP_SIZES = ['4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'];
const KIDS_BOTTOM_SIZES = ['4', '6', '8', '10', '12', '14'];

function sizesFor(category, subCategory) {
  const pool = category === 'Kids'
    ? (subCategory === 'Bottomwear' ? KIDS_BOTTOM_SIZES : KIDS_TOP_SIZES)
    : (subCategory === 'Bottomwear' ? ADULT_BOTTOM_SIZES : ADULT_TOP_SIZES);
  return pickN(pool, 3 + Math.floor(rand() * 3)); // 3-5 sizes
}

function buildProduct(category, sub, index, usedNames) {
  const g = GROUPS[`${category}|${sub}`];
  const item = g.items[index % g.items.length];
  const round = Math.floor(index / g.items.length);
  let name = `${category === 'Kids' ? 'Kids ' : ''}${pick(COLORS)} ${pick(PATTERNS)} ${pick(g.fits)} ${item}`.replace('Solid ', '');
  if (round > 0) name += ` ${['Edition II', 'New Season', 'Classic Reissue', 'Updated Fit'][round % 4]}`;
  if (usedNames.has(name)) name += ` V${index}`;
  usedNames.add(name);

  const fabric = pick(g.fabrics);
  const description =
    `${name}. Crafted from ${fabric} for lasting comfort and a polished look. ` +
    `${pick(g.details)} ${pick(OCCASIONS)} ${pick(CARE)}`;

  const price = Math.round((g.priceMin + rand() * (g.priceMax - g.priceMin)) * 100) / 100;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return {
    name,
    description,
    price,
    image: poolImages(slug),
    category,
    subCategory: sub,
    sizes: sizesFor(category, sub),
    bestseller: index % 10 === 0,
    date: Date.now() - Math.floor(rand() * 365 * 24 * 60 * 60 * 1000),
  };
}

async function main() {
  const mongoUrl = `${process.env.MONGoDB_URL}/E-comm`;
  await mongoose.connect(mongoUrl);

  // Rewrites image URLs of existing products to the local pool (keeps everything else).
  if (process.argv.includes('--images-only')) {
    console.log('Updating image URLs of existing products...');
    const all = await productModel.find({}, { _id: 1 });
    const ops = all.map((p) => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { image: poolImages(String(p._id)) } },
      },
    }));
    for (let i = 0; i < ops.length; i += 500) {
      await productModel.bulkWrite(ops.slice(i, i + 500));
      console.log(`  updated ${Math.min(i + 500, ops.length)}/${ops.length}`);
    }
    console.log('Done.');
    await mongoose.disconnect();
    return;
  }

  console.log('Connected, clearing existing products...');
  await productModel.deleteMany({});

  // 1000 total: Men 334, Women 333, Kids 333
  const plan = [
    ['Men', 'Topwear', 112], ['Men', 'Bottomwear', 111], ['Men', 'Winterwear', 111],
    ['Women', 'Topwear', 111], ['Women', 'Bottomwear', 111], ['Women', 'Winterwear', 111],
    ['Kids', 'Topwear', 111], ['Kids', 'Bottomwear', 111], ['Kids', 'Winterwear', 111],
  ];
  const usedNames = new Set();
  const docs = [];
  for (const [cat, sub, count] of plan) {
    for (let i = 0; i < count; i++) docs.push(buildProduct(cat, sub, i, usedNames));
  }
  console.log(`Generated ${docs.length} products, inserting in batches...`);
  for (let i = 0; i < docs.length; i += 250) {
    await productModel.insertMany(docs.slice(i, i + 250));
    console.log(`  inserted ${Math.min(i + 250, docs.length)}/${docs.length}`);
  }
  const total = await productModel.countDocuments();
  console.log(`Done. Total products in DB: ${total}`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
