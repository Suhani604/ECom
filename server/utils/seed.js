// ─────────────────────────────────────────────────────────────
//  seed.js  —  4-level category structure (like Meesho)
//  Level 1: Category     → Men, Women, Kids
//  Level 2: Item Type    → Ethnic Wear, Western Wear, Shoes...
//  Level 3: Sub Item Type→ Kurtis Sets & Fabrics, Sarees...
//  Level 4: Item Name    → Kurtis, Kurti Fabrics...
//
//  Usage:  node server/utils/seed.js
// ─────────────────────────────────────────────────────────────
import 'dotenv/config'
import mongoose         from 'mongoose'
import connectDB        from '../config/db.js'
import Category         from '../models/Category.js'
import Size             from '../models/Size.js'
import Color            from '../models/Color.js'
import AdditionalDetail from '../models/AdditionalDetail.js'

await connectDB()
console.log('\n🌱  Seeding started...\n')

// ── Clear old data ─────────────────────────────────────────────
await Category.deleteMany({})
await Size.deleteMany({})
await Color.deleteMany({})
await AdditionalDetail.deleteMany({})
console.log('🗑   Cleared old data')

// ══════════════════════════════════════════════════════════════
// LEVEL 1 — Categories
// ══════════════════════════════════════════════════════════════
const [men, women, kids] = await Category.insertMany([
  { name: 'Men',   slug: 'men',   parent: null, level: 1, sortOrder: 0, isActive: true },
  { name: 'Women', slug: 'women', parent: null, level: 1, sortOrder: 1, isActive: true },
  { name: 'Kids',  slug: 'kids',  parent: null, level: 1, sortOrder: 2, isActive: true },
])
console.log('✅  Level 1 — Categories inserted')

// ══════════════════════════════════════════════════════════════
// LEVEL 2 — Item Types (per Category)
// ══════════════════════════════════════════════════════════════
const [
  // Men item types
  menEthnic, menWestern, menShoes, menWatches, menAccessories, menJewellery, menSports, menInnerwear,
  // Women item types
  womenEthnic, womenWestern, womenShoes, womenWatches, womenAccessories, womenJewellery, womenSports, womenNightwear, womenInnerwear,
  // Kids item types
  kidsClothing, kidsShoes,
] = await Category.insertMany([
  // ── Men
  { name: 'Ethnic Wear',   slug: 'men-ethnic',        parent: men._id,   level: 2, sortOrder: 0, isActive: true },
  { name: 'Western Wear',  slug: 'men-western',       parent: men._id,   level: 2, sortOrder: 1, isActive: true },
  { name: 'Shoes',         slug: 'men-shoes',         parent: men._id,   level: 2, sortOrder: 2, isActive: true },
  { name: 'Watches',       slug: 'men-watches',       parent: men._id,   level: 2, sortOrder: 3, isActive: true },
  { name: 'Accessories',   slug: 'men-accessories',   parent: men._id,   level: 2, sortOrder: 4, isActive: true },
  { name: 'Jewellery',     slug: 'men-jewellery',     parent: men._id,   level: 2, sortOrder: 5, isActive: true },
  { name: 'Sports & Gym',  slug: 'men-sports',        parent: men._id,   level: 2, sortOrder: 6, isActive: true },
  { name: 'Innerwear',     slug: 'men-innerwear',     parent: men._id,   level: 2, sortOrder: 7, isActive: true },
  // ── Women
  { name: 'Ethnic Wear',   slug: 'women-ethnic',      parent: women._id, level: 2, sortOrder: 0, isActive: true },
  { name: 'Western Wear',  slug: 'women-western',     parent: women._id, level: 2, sortOrder: 1, isActive: true },
  { name: 'Shoes',         slug: 'women-shoes',       parent: women._id, level: 2, sortOrder: 2, isActive: true },
  { name: 'Watches',       slug: 'women-watches',     parent: women._id, level: 2, sortOrder: 3, isActive: true },
  { name: 'Accessories',   slug: 'women-accessories', parent: women._id, level: 2, sortOrder: 4, isActive: true },
  { name: 'Jewellery',     slug: 'women-jewellery',   parent: women._id, level: 2, sortOrder: 5, isActive: true },
  { name: 'Sports & Gym',  slug: 'women-sports',      parent: women._id, level: 2, sortOrder: 6, isActive: true },
  { name: 'Nightwear',     slug: 'women-nightwear',   parent: women._id, level: 2, sortOrder: 7, isActive: true },
  { name: 'Innerwear',     slug: 'women-innerwear',   parent: women._id, level: 2, sortOrder: 8, isActive: true },
  // ── Kids
  { name: 'Clothing',      slug: 'kids-clothing',     parent: kids._id,  level: 2, sortOrder: 0, isActive: true },
  { name: 'Shoes',         slug: 'kids-shoes',        parent: kids._id,  level: 2, sortOrder: 1, isActive: true },
])
console.log('✅  Level 2 — Item Types inserted')

// ══════════════════════════════════════════════════════════════
// LEVEL 3 — Sub Item Types (per Item Type)
// ══════════════════════════════════════════════════════════════
const subItemTypes = await Category.insertMany([

  // ── Men → Ethnic Wear
  { name: 'Kurtas & Kurtis',        slug: 'men-eth-kurtas',      parent: menEthnic._id,        level: 3, sortOrder: 0, isActive: true },
  { name: 'Sherwanis',              slug: 'men-eth-sherwani',    parent: menEthnic._id,        level: 3, sortOrder: 1, isActive: true },
  { name: 'Ethnic Sets',            slug: 'men-eth-sets',        parent: menEthnic._id,        level: 3, sortOrder: 2, isActive: true },
  { name: 'Dhotis & Mundus',        slug: 'men-eth-dhotis',      parent: menEthnic._id,        level: 3, sortOrder: 3, isActive: true },
  { name: 'Nehru Jackets',          slug: 'men-eth-nehru',       parent: menEthnic._id,        level: 3, sortOrder: 4, isActive: true },
  { name: 'Pathani Suits',          slug: 'men-eth-pathani',     parent: menEthnic._id,        level: 3, sortOrder: 5, isActive: true },

  // ── Men → Western Wear
  { name: 'T-Shirts & Polos',       slug: 'men-wes-tshirts',     parent: menWestern._id,       level: 3, sortOrder: 0, isActive: true },
  { name: 'Casual Shirts',          slug: 'men-wes-casual',      parent: menWestern._id,       level: 3, sortOrder: 1, isActive: true },
  { name: 'Formal Shirts',          slug: 'men-wes-formal',      parent: menWestern._id,       level: 3, sortOrder: 2, isActive: true },
  { name: 'Jeans & Trousers',       slug: 'men-wes-jeans',       parent: menWestern._id,       level: 3, sortOrder: 3, isActive: true },
  { name: 'Shorts & 3/4ths',        slug: 'men-wes-shorts',      parent: menWestern._id,       level: 3, sortOrder: 4, isActive: true },
  { name: 'Jackets & Coats',        slug: 'men-wes-jackets',     parent: menWestern._id,       level: 3, sortOrder: 5, isActive: true },
  { name: 'Sweatshirts & Hoodies',  slug: 'men-wes-hoodies',     parent: menWestern._id,       level: 3, sortOrder: 6, isActive: true },
  { name: 'Blazers & Suits',        slug: 'men-wes-blazers',     parent: menWestern._id,       level: 3, sortOrder: 7, isActive: true },

  // ── Men → Shoes
  { name: 'Casual Shoes',           slug: 'men-sho-casual',      parent: menShoes._id,         level: 3, sortOrder: 0, isActive: true },
  { name: 'Formal Shoes',           slug: 'men-sho-formal',      parent: menShoes._id,         level: 3, sortOrder: 1, isActive: true },
  { name: 'Sports & Running',       slug: 'men-sho-sports',      parent: menShoes._id,         level: 3, sortOrder: 2, isActive: true },
  { name: 'Sandals & Flip-Flops',   slug: 'men-sho-sandals',     parent: menShoes._id,         level: 3, sortOrder: 3, isActive: true },
  { name: 'Boots',                  slug: 'men-sho-boots',       parent: menShoes._id,         level: 3, sortOrder: 4, isActive: true },

  // ── Men → Watches
  { name: 'Analog Watches',         slug: 'men-wat-analog',      parent: menWatches._id,       level: 3, sortOrder: 0, isActive: true },
  { name: 'Digital Watches',        slug: 'men-wat-digital',     parent: menWatches._id,       level: 3, sortOrder: 1, isActive: true },
  { name: 'Smart Watches',          slug: 'men-wat-smart',       parent: menWatches._id,       level: 3, sortOrder: 2, isActive: true },
  { name: 'Luxury Watches',         slug: 'men-wat-luxury',      parent: menWatches._id,       level: 3, sortOrder: 3, isActive: true },

  // ── Men → Accessories
  { name: 'Bags & Backpacks',       slug: 'men-acc-bags',        parent: menAccessories._id,   level: 3, sortOrder: 0, isActive: true },
  { name: 'Belts',                  slug: 'men-acc-belts',       parent: menAccessories._id,   level: 3, sortOrder: 1, isActive: true },
  { name: 'Wallets',                slug: 'men-acc-wallets',     parent: menAccessories._id,   level: 3, sortOrder: 2, isActive: true },
  { name: 'Sunglasses',             slug: 'men-acc-sunglasses',  parent: menAccessories._id,   level: 3, sortOrder: 3, isActive: true },
  { name: 'Caps & Hats',            slug: 'men-acc-caps',        parent: menAccessories._id,   level: 3, sortOrder: 4, isActive: true },

  // ── Men → Jewellery
  { name: 'Rings',                  slug: 'men-jwl-rings',       parent: menJewellery._id,     level: 3, sortOrder: 0, isActive: true },
  { name: 'Chains & Necklaces',     slug: 'men-jwl-chains',      parent: menJewellery._id,     level: 3, sortOrder: 1, isActive: true },
  { name: 'Bracelets',              slug: 'men-jwl-bracelets',   parent: menJewellery._id,     level: 3, sortOrder: 2, isActive: true },

  // ── Men → Sports
  { name: 'Sports T-Shirts',        slug: 'men-spt-tshirts',     parent: menSports._id,        level: 3, sortOrder: 0, isActive: true },
  { name: 'Tracksuits',             slug: 'men-spt-tracksuits',  parent: menSports._id,        level: 3, sortOrder: 1, isActive: true },
  { name: 'Gym Wear',               slug: 'men-spt-gym',         parent: menSports._id,        level: 3, sortOrder: 2, isActive: true },

  // ── Men → Innerwear
  { name: 'Briefs & Trunks',        slug: 'men-inn-briefs',      parent: menInnerwear._id,     level: 3, sortOrder: 0, isActive: true },
  { name: 'Vests & Undershirts',    slug: 'men-inn-vests',       parent: menInnerwear._id,     level: 3, sortOrder: 1, isActive: true },
  { name: 'Socks',                  slug: 'men-inn-socks',       parent: menInnerwear._id,     level: 3, sortOrder: 2, isActive: true },

  // ── Women → Ethnic Wear
  { name: 'Kurtis, Sets & Fabrics',      slug: 'wom-eth-kurtis',      parent: womenEthnic._id,      level: 3, sortOrder: 0, isActive: true },
  { name: 'Sarees, Blouses & Petticoats',slug: 'wom-eth-sarees',      parent: womenEthnic._id,      level: 3, sortOrder: 1, isActive: true },
  { name: 'Suits & Dress Material',      slug: 'wom-eth-suits',       parent: womenEthnic._id,      level: 3, sortOrder: 2, isActive: true },
  { name: 'Ethnic Bottomwear',           slug: 'wom-eth-bottom',      parent: womenEthnic._id,      level: 3, sortOrder: 3, isActive: true },
  { name: 'Dupattas & Shawls',           slug: 'wom-eth-dupattas',    parent: womenEthnic._id,      level: 3, sortOrder: 4, isActive: true },
  { name: 'Ethnic Jackets',              slug: 'wom-eth-jackets',     parent: womenEthnic._id,      level: 3, sortOrder: 5, isActive: true },
  { name: 'Lehengas & Skirts',           slug: 'wom-eth-lehenga',     parent: womenEthnic._id,      level: 3, sortOrder: 6, isActive: true },

  // ── Women → Western Wear
  { name: 'Tops & T-Shirts',        slug: 'wom-wes-tops',        parent: womenWestern._id,     level: 3, sortOrder: 0, isActive: true },
  { name: 'Shirts & Tunics',        slug: 'wom-wes-shirts',      parent: womenWestern._id,     level: 3, sortOrder: 1, isActive: true },
  { name: 'Dresses & Gowns',        slug: 'wom-wes-dresses',     parent: womenWestern._id,     level: 3, sortOrder: 2, isActive: true },
  { name: 'Jeans & Jeggings',       slug: 'wom-wes-jeans',       parent: womenWestern._id,     level: 3, sortOrder: 3, isActive: true },
  { name: 'Trousers & Palazzos',    slug: 'wom-wes-trousers',    parent: womenWestern._id,     level: 3, sortOrder: 4, isActive: true },
  { name: 'Shorts & Skirts',        slug: 'wom-wes-shorts',      parent: womenWestern._id,     level: 3, sortOrder: 5, isActive: true },
  { name: 'Jackets & Coats',        slug: 'wom-wes-jackets',     parent: womenWestern._id,     level: 3, sortOrder: 6, isActive: true },
  { name: 'Sweatshirts & Hoodies',  slug: 'wom-wes-hoodies',     parent: womenWestern._id,     level: 3, sortOrder: 7, isActive: true },
  { name: 'Co-ords & Sets',         slug: 'wom-wes-coords',      parent: womenWestern._id,     level: 3, sortOrder: 8, isActive: true },
  { name: 'Blazers',                slug: 'wom-wes-blazers',     parent: womenWestern._id,     level: 3, sortOrder: 9, isActive: true },

  // ── Women → Shoes
  { name: 'Heels',                  slug: 'wom-sho-heels',       parent: womenShoes._id,       level: 3, sortOrder: 0, isActive: true },
  { name: 'Flats & Ballerinas',     slug: 'wom-sho-flats',       parent: womenShoes._id,       level: 3, sortOrder: 1, isActive: true },
  { name: 'Sandals',                slug: 'wom-sho-sandals',     parent: womenShoes._id,       level: 3, sortOrder: 2, isActive: true },
  { name: 'Sports Shoes',           slug: 'wom-sho-sports',      parent: womenShoes._id,       level: 3, sortOrder: 3, isActive: true },
  { name: 'Boots',                  slug: 'wom-sho-boots',       parent: womenShoes._id,       level: 3, sortOrder: 4, isActive: true },
  { name: 'Ethnic Footwear',        slug: 'wom-sho-ethnic',      parent: womenShoes._id,       level: 3, sortOrder: 5, isActive: true },

  // ── Women → Watches
  { name: 'Analog Watches',         slug: 'wom-wat-analog',      parent: womenWatches._id,     level: 3, sortOrder: 0, isActive: true },
  { name: 'Smart Watches',          slug: 'wom-wat-smart',       parent: womenWatches._id,     level: 3, sortOrder: 1, isActive: true },
  { name: 'Fashion Watches',        slug: 'wom-wat-fashion',     parent: womenWatches._id,     level: 3, sortOrder: 2, isActive: true },

  // ── Women → Accessories
  { name: 'Handbags & Clutches',    slug: 'wom-acc-bags',        parent: womenAccessories._id, level: 3, sortOrder: 0, isActive: true },
  { name: 'Sunglasses',             slug: 'wom-acc-sunglasses',  parent: womenAccessories._id, level: 3, sortOrder: 1, isActive: true },
  { name: 'Scarves & Stoles',       slug: 'wom-acc-scarves',     parent: womenAccessories._id, level: 3, sortOrder: 2, isActive: true },
  { name: 'Belts',                  slug: 'wom-acc-belts',       parent: womenAccessories._id, level: 3, sortOrder: 3, isActive: true },
  { name: 'Hair Accessories',       slug: 'wom-acc-hair',        parent: womenAccessories._id, level: 3, sortOrder: 4, isActive: true },
  { name: 'Caps & Hats',            slug: 'wom-acc-caps',        parent: womenAccessories._id, level: 3, sortOrder: 5, isActive: true },

  // ── Women → Jewellery
  { name: 'Necklaces & Chains',     slug: 'wom-jwl-necklaces',   parent: womenJewellery._id,   level: 3, sortOrder: 0, isActive: true },
  { name: 'Earrings',               slug: 'wom-jwl-earrings',    parent: womenJewellery._id,   level: 3, sortOrder: 1, isActive: true },
  { name: 'Bangles & Bracelets',    slug: 'wom-jwl-bangles',     parent: womenJewellery._id,   level: 3, sortOrder: 2, isActive: true },
  { name: 'Rings',                  slug: 'wom-jwl-rings',       parent: womenJewellery._id,   level: 3, sortOrder: 3, isActive: true },
  { name: 'Anklets',                slug: 'wom-jwl-anklets',     parent: womenJewellery._id,   level: 3, sortOrder: 4, isActive: true },
  { name: 'Nose Pins',              slug: 'wom-jwl-nosepins',    parent: womenJewellery._id,   level: 3, sortOrder: 5, isActive: true },
  { name: 'Maang Tikka',            slug: 'wom-jwl-maangtikka',  parent: womenJewellery._id,   level: 3, sortOrder: 6, isActive: true },
  { name: 'Pendants',               slug: 'wom-jwl-pendants',    parent: womenJewellery._id,   level: 3, sortOrder: 7, isActive: true },
  { name: 'Mangalsutra',            slug: 'wom-jwl-mangalsutra', parent: womenJewellery._id,   level: 3, sortOrder: 8, isActive: true },
  { name: 'Sets & Combos',          slug: 'wom-jwl-sets',        parent: womenJewellery._id,   level: 3, sortOrder: 9, isActive: true },

  // ── Women → Sports
  { name: 'Sports Tops & T-Shirts', slug: 'wom-spt-tops',        parent: womenSports._id,      level: 3, sortOrder: 0, isActive: true },
  { name: 'Sports Bras',            slug: 'wom-spt-bras',        parent: womenSports._id,      level: 3, sortOrder: 1, isActive: true },
  { name: 'Leggings & Tights',      slug: 'wom-spt-leggings',    parent: womenSports._id,      level: 3, sortOrder: 2, isActive: true },
  { name: 'Tracksuits',             slug: 'wom-spt-tracksuits',  parent: womenSports._id,      level: 3, sortOrder: 3, isActive: true },

  // ── Women → Nightwear
  { name: 'Night Suits',            slug: 'wom-nit-suits',       parent: womenNightwear._id,   level: 3, sortOrder: 0, isActive: true },
  { name: 'Nightgowns & Robes',     slug: 'wom-nit-gowns',       parent: womenNightwear._id,   level: 3, sortOrder: 1, isActive: true },
  { name: 'Shorts & Top Sets',      slug: 'wom-nit-shorts',      parent: womenNightwear._id,   level: 3, sortOrder: 2, isActive: true },

  // ── Women → Innerwear
  { name: 'Bras',                   slug: 'wom-inn-bras',        parent: womenInnerwear._id,   level: 3, sortOrder: 0, isActive: true },
  { name: 'Panties & Briefs',       slug: 'wom-inn-panties',     parent: womenInnerwear._id,   level: 3, sortOrder: 1, isActive: true },
  { name: 'Shapewear',              slug: 'wom-inn-shapewear',   parent: womenInnerwear._id,   level: 3, sortOrder: 2, isActive: true },
  { name: 'Camisoles & Slips',      slug: 'wom-inn-camisoles',   parent: womenInnerwear._id,   level: 3, sortOrder: 3, isActive: true },
  { name: 'Socks & Stockings',      slug: 'wom-inn-socks',       parent: womenInnerwear._id,   level: 3, sortOrder: 4, isActive: true },

  // ── Kids → Clothing
  { name: 'Boys Clothing',          slug: 'kid-clo-boys',        parent: kidsClothing._id,     level: 3, sortOrder: 0, isActive: true },
  { name: 'Girls Clothing',         slug: 'kid-clo-girls',       parent: kidsClothing._id,     level: 3, sortOrder: 1, isActive: true },
  { name: 'Baby Clothing',          slug: 'kid-clo-baby',        parent: kidsClothing._id,     level: 3, sortOrder: 2, isActive: true },
  { name: 'Party Wear',             slug: 'kid-clo-party',       parent: kidsClothing._id,     level: 3, sortOrder: 3, isActive: true },
  { name: 'Boys Innerwear',         slug: 'kid-clo-boysinn',     parent: kidsClothing._id,     level: 3, sortOrder: 4, isActive: true },
  { name: 'Girls Innerwear',        slug: 'kid-clo-girlsinn',    parent: kidsClothing._id,     level: 3, sortOrder: 5, isActive: true },

  // ── Kids → Shoes
  { name: 'Boys Shoes',             slug: 'kid-sho-boys',        parent: kidsShoes._id,        level: 3, sortOrder: 0, isActive: true },
  { name: 'Girls Shoes',            slug: 'kid-sho-girls',       parent: kidsShoes._id,        level: 3, sortOrder: 1, isActive: true },
  { name: 'Baby Shoes',             slug: 'kid-sho-baby',        parent: kidsShoes._id,        level: 3, sortOrder: 2, isActive: true },
])
console.log('✅  Level 3 — Sub Item Types inserted')

// helper to find subItemType _id by slug
const sub = (slug) => subItemTypes.find(s => s.slug === slug)

// ══════════════════════════════════════════════════════════════
// LEVEL 4 — Item Names (per Sub Item Type)
// ══════════════════════════════════════════════════════════════
const itemNames = await Category.insertMany([

  // ── Men → Ethnic Wear → Kurtas & Kurtis
  { name: 'Kurtas',                 slug: 'men-eth-kurtas-kurtas',    parent: sub('men-eth-kurtas')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Kurta Sets',             slug: 'men-eth-kurtas-sets',      parent: sub('men-eth-kurtas')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Long Kurtas',            slug: 'men-eth-kurtas-long',      parent: sub('men-eth-kurtas')._id,    level: 4, sortOrder: 2, isActive: true },
  { name: 'Printed Kurtas',         slug: 'men-eth-kurtas-printed',   parent: sub('men-eth-kurtas')._id,    level: 4, sortOrder: 3, isActive: true },

  // ── Men → Ethnic Wear → Sherwanis
  { name: 'Sherwani',               slug: 'men-eth-sherwani-sherwani',parent: sub('men-eth-sherwani')._id,  level: 4, sortOrder: 0, isActive: true },
  { name: 'Sherwani Sets',          slug: 'men-eth-sherwani-sets',    parent: sub('men-eth-sherwani')._id,  level: 4, sortOrder: 1, isActive: true },
  { name: 'Indo-Western Sherwani',  slug: 'men-eth-sherwani-indo',    parent: sub('men-eth-sherwani')._id,  level: 4, sortOrder: 2, isActive: true },

  // ── Men → Ethnic Wear → Ethnic Sets
  { name: 'Kurta Pyjama Sets',      slug: 'men-eth-sets-kpsets',      parent: sub('men-eth-sets')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Dhoti Kurta Sets',       slug: 'men-eth-sets-dhoti',       parent: sub('men-eth-sets')._id,      level: 4, sortOrder: 1, isActive: true },

  // ── Men → Ethnic Wear → Dhotis
  { name: 'Dhotis',                 slug: 'men-eth-dhotis-dhoti',     parent: sub('men-eth-dhotis')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Mundus',                 slug: 'men-eth-dhotis-mundu',     parent: sub('men-eth-dhotis')._id,    level: 4, sortOrder: 1, isActive: true },

  // ── Men → Ethnic Wear → Nehru Jackets
  { name: 'Nehru Jackets',          slug: 'men-eth-nehru-jackets',    parent: sub('men-eth-nehru')._id,     level: 4, sortOrder: 0, isActive: true },

  // ── Men → Ethnic Wear → Pathani Suits
  { name: 'Pathani Suits',          slug: 'men-eth-pathani-suits',    parent: sub('men-eth-pathani')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Afghan Kameez',          slug: 'men-eth-pathani-afghan',   parent: sub('men-eth-pathani')._id,   level: 4, sortOrder: 1, isActive: true },

  // ── Men → Western → T-Shirts & Polos
  { name: 'Round Neck T-Shirts',    slug: 'men-wes-ts-round',         parent: sub('men-wes-tshirts')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Polo T-Shirts',          slug: 'men-wes-ts-polo',          parent: sub('men-wes-tshirts')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'V-Neck T-Shirts',        slug: 'men-wes-ts-vneck',         parent: sub('men-wes-tshirts')._id,   level: 4, sortOrder: 2, isActive: true },
  { name: 'Printed T-Shirts',       slug: 'men-wes-ts-printed',       parent: sub('men-wes-tshirts')._id,   level: 4, sortOrder: 3, isActive: true },
  { name: 'Oversized T-Shirts',     slug: 'men-wes-ts-oversized',     parent: sub('men-wes-tshirts')._id,   level: 4, sortOrder: 4, isActive: true },

  // ── Men → Western → Casual Shirts
  { name: 'Regular Fit Shirts',     slug: 'men-wes-cas-regular',      parent: sub('men-wes-casual')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Slim Fit Shirts',        slug: 'men-wes-cas-slim',         parent: sub('men-wes-casual')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Printed Shirts',         slug: 'men-wes-cas-printed',      parent: sub('men-wes-casual')._id,    level: 4, sortOrder: 2, isActive: true },
  { name: 'Denim Shirts',           slug: 'men-wes-cas-denim',        parent: sub('men-wes-casual')._id,    level: 4, sortOrder: 3, isActive: true },

  // ── Men → Western → Formal Shirts
  { name: 'Solid Formal Shirts',    slug: 'men-wes-for-solid',        parent: sub('men-wes-formal')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Striped Formal Shirts',  slug: 'men-wes-for-striped',      parent: sub('men-wes-formal')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Checked Formal Shirts',  slug: 'men-wes-for-checked',      parent: sub('men-wes-formal')._id,    level: 4, sortOrder: 2, isActive: true },

  // ── Men → Western → Jeans & Trousers
  { name: 'Slim Fit Jeans',         slug: 'men-wes-jns-slim',         parent: sub('men-wes-jeans')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Regular Fit Jeans',      slug: 'men-wes-jns-regular',      parent: sub('men-wes-jeans')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Skinny Jeans',           slug: 'men-wes-jns-skinny',       parent: sub('men-wes-jeans')._id,     level: 4, sortOrder: 2, isActive: true },
  { name: 'Formal Trousers',        slug: 'men-wes-jns-trousers',     parent: sub('men-wes-jeans')._id,     level: 4, sortOrder: 3, isActive: true },
  { name: 'Chinos',                 slug: 'men-wes-jns-chinos',       parent: sub('men-wes-jeans')._id,     level: 4, sortOrder: 4, isActive: true },
  { name: 'Cargo Pants',            slug: 'men-wes-jns-cargo',        parent: sub('men-wes-jeans')._id,     level: 4, sortOrder: 5, isActive: true },

  // ── Men → Western → Shorts
  { name: 'Casual Shorts',          slug: 'men-wes-sho-casual',       parent: sub('men-wes-shorts')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Denim Shorts',           slug: 'men-wes-sho-denim',        parent: sub('men-wes-shorts')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Sports Shorts',          slug: 'men-wes-sho-sports',       parent: sub('men-wes-shorts')._id,    level: 4, sortOrder: 2, isActive: true },

  // ── Men → Western → Jackets
  { name: 'Casual Jackets',         slug: 'men-wes-jac-casual',       parent: sub('men-wes-jackets')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Denim Jackets',          slug: 'men-wes-jac-denim',        parent: sub('men-wes-jackets')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Leather Jackets',        slug: 'men-wes-jac-leather',      parent: sub('men-wes-jackets')._id,   level: 4, sortOrder: 2, isActive: true },
  { name: 'Windcheaters',           slug: 'men-wes-jac-wind',         parent: sub('men-wes-jackets')._id,   level: 4, sortOrder: 3, isActive: true },
  { name: 'Puffer Jackets',         slug: 'men-wes-jac-puffer',       parent: sub('men-wes-jackets')._id,   level: 4, sortOrder: 4, isActive: true },

  // ── Men → Western → Sweatshirts
  { name: 'Sweatshirts',            slug: 'men-wes-hoo-sweat',        parent: sub('men-wes-hoodies')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Hoodies',                slug: 'men-wes-hoo-hoodie',       parent: sub('men-wes-hoodies')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Zip-Up Hoodies',         slug: 'men-wes-hoo-zip',          parent: sub('men-wes-hoodies')._id,   level: 4, sortOrder: 2, isActive: true },

  // ── Men → Western → Blazers
  { name: 'Casual Blazers',         slug: 'men-wes-bla-casual',       parent: sub('men-wes-blazers')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Formal Blazers',         slug: 'men-wes-bla-formal',       parent: sub('men-wes-blazers')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Suits',                  slug: 'men-wes-bla-suits',        parent: sub('men-wes-blazers')._id,   level: 4, sortOrder: 2, isActive: true },

  // ── Men → Shoes
  { name: 'Sneakers',               slug: 'men-sho-cas-sneakers',     parent: sub('men-sho-casual')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Loafers',                slug: 'men-sho-cas-loafers',      parent: sub('men-sho-casual')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Canvas Shoes',           slug: 'men-sho-cas-canvas',       parent: sub('men-sho-casual')._id,    level: 4, sortOrder: 2, isActive: true },
  { name: 'Oxford Shoes',           slug: 'men-sho-for-oxford',       parent: sub('men-sho-formal')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Derby Shoes',            slug: 'men-sho-for-derby',        parent: sub('men-sho-formal')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Monk Strap',             slug: 'men-sho-for-monk',         parent: sub('men-sho-formal')._id,    level: 4, sortOrder: 2, isActive: true },
  { name: 'Running Shoes',          slug: 'men-sho-spt-running',      parent: sub('men-sho-sports')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Walking Shoes',          slug: 'men-sho-spt-walking',      parent: sub('men-sho-sports')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Football Shoes',         slug: 'men-sho-spt-football',     parent: sub('men-sho-sports')._id,    level: 4, sortOrder: 2, isActive: true },
  { name: 'Sandals',                slug: 'men-sho-san-sandals',      parent: sub('men-sho-sandals')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Flip-Flops',             slug: 'men-sho-san-flip',         parent: sub('men-sho-sandals')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Ankle Boots',            slug: 'men-sho-boo-ankle',        parent: sub('men-sho-boots')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Chelsea Boots',          slug: 'men-sho-boo-chelsea',      parent: sub('men-sho-boots')._id,     level: 4, sortOrder: 1, isActive: true },

  // ── Men → Watches
  { name: 'Analog Watches',         slug: 'men-wat-ana-watches',      parent: sub('men-wat-analog')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Chronograph Watches',    slug: 'men-wat-ana-chrono',       parent: sub('men-wat-analog')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Digital Watches',        slug: 'men-wat-dig-watches',      parent: sub('men-wat-digital')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Smart Watches',          slug: 'men-wat-smt-watches',      parent: sub('men-wat-smart')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Fitness Bands',          slug: 'men-wat-smt-bands',        parent: sub('men-wat-smart')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Luxury Watches',         slug: 'men-wat-lux-watches',      parent: sub('men-wat-luxury')._id,    level: 4, sortOrder: 0, isActive: true },

  // ── Men → Accessories
  { name: 'Backpacks',              slug: 'men-acc-bag-backpacks',    parent: sub('men-acc-bags')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Messenger Bags',         slug: 'men-acc-bag-messenger',    parent: sub('men-acc-bags')._id,      level: 4, sortOrder: 1, isActive: true },
  { name: 'Travel Bags',            slug: 'men-acc-bag-travel',       parent: sub('men-acc-bags')._id,      level: 4, sortOrder: 2, isActive: true },
  { name: 'Formal Belts',           slug: 'men-acc-bel-formal',       parent: sub('men-acc-belts')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Casual Belts',           slug: 'men-acc-bel-casual',       parent: sub('men-acc-belts')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Leather Wallets',        slug: 'men-acc-wal-leather',      parent: sub('men-acc-wallets')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Card Holders',           slug: 'men-acc-wal-card',         parent: sub('men-acc-wallets')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Sunglasses',             slug: 'men-acc-sun-glasses',      parent: sub('men-acc-sunglasses')._id,level: 4, sortOrder: 0, isActive: true },
  { name: 'Caps',                   slug: 'men-acc-cap-caps',         parent: sub('men-acc-caps')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Hats',                   slug: 'men-acc-cap-hats',         parent: sub('men-acc-caps')._id,      level: 4, sortOrder: 1, isActive: true },
  { name: 'Beanies',                slug: 'men-acc-cap-beanies',      parent: sub('men-acc-caps')._id,      level: 4, sortOrder: 2, isActive: true },

  // ── Men → Jewellery
  { name: 'Gold Rings',             slug: 'men-jwl-rin-gold',         parent: sub('men-jwl-rings')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Silver Rings',           slug: 'men-jwl-rin-silver',       parent: sub('men-jwl-rings')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Chains',                 slug: 'men-jwl-cha-chains',       parent: sub('men-jwl-chains')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Pendants',               slug: 'men-jwl-cha-pendants',     parent: sub('men-jwl-chains')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Bracelets',              slug: 'men-jwl-bra-bracelets',    parent: sub('men-jwl-bracelets')._id, level: 4, sortOrder: 0, isActive: true },

  // ── Men → Sports
  { name: 'Sports T-Shirts',        slug: 'men-spt-ts-sports',        parent: sub('men-spt-tshirts')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Compression Tops',       slug: 'men-spt-ts-compression',   parent: sub('men-spt-tshirts')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Track Pants',            slug: 'men-spt-tra-track',        parent: sub('men-spt-tracksuits')._id,level: 4, sortOrder: 0, isActive: true },
  { name: 'Tracksuit Sets',         slug: 'men-spt-tra-sets',         parent: sub('men-spt-tracksuits')._id,level: 4, sortOrder: 1, isActive: true },
  { name: 'Gym Shorts',             slug: 'men-spt-gym-shorts',       parent: sub('men-spt-gym')._id,       level: 4, sortOrder: 0, isActive: true },
  { name: 'Gym Vests',              slug: 'men-spt-gym-vests',        parent: sub('men-spt-gym')._id,       level: 4, sortOrder: 1, isActive: true },

  // ── Men → Innerwear
  { name: 'Briefs',                 slug: 'men-inn-bri-briefs',       parent: sub('men-inn-briefs')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Trunks',                 slug: 'men-inn-bri-trunks',       parent: sub('men-inn-briefs')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Boxers',                 slug: 'men-inn-bri-boxers',       parent: sub('men-inn-briefs')._id,    level: 4, sortOrder: 2, isActive: true },
  { name: 'Vests',                  slug: 'men-inn-ves-vests',        parent: sub('men-inn-vests')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Thermal Tops',           slug: 'men-inn-ves-thermal',      parent: sub('men-inn-vests')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Socks',                  slug: 'men-inn-soc-socks',        parent: sub('men-inn-socks')._id,     level: 4, sortOrder: 0, isActive: true },

  // ── Women → Ethnic Wear → Kurtis, Sets & Fabrics
  { name: 'Kurtis',                 slug: 'wom-eth-kur-kurtis',       parent: sub('wom-eth-kurtis')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Kurti With Bottomwear',  slug: 'wom-eth-kur-withbottom',   parent: sub('wom-eth-kurtis')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Kurti Fabrics',          slug: 'wom-eth-kur-fabrics',      parent: sub('wom-eth-kurtis')._id,    level: 4, sortOrder: 2, isActive: true },
  { name: 'Kurti With Dupatta',     slug: 'wom-eth-kur-withdupatta',  parent: sub('wom-eth-kurtis')._id,    level: 4, sortOrder: 3, isActive: true },
  { name: 'Kurti Sets',             slug: 'wom-eth-kur-sets',         parent: sub('wom-eth-kurtis')._id,    level: 4, sortOrder: 4, isActive: true },

  // ── Women → Ethnic Wear → Sarees
  { name: 'Sarees',                 slug: 'wom-eth-sar-sarees',       parent: sub('wom-eth-sarees')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Ready to Wear Sarees',   slug: 'wom-eth-sar-readywear',    parent: sub('wom-eth-sarees')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Blouses',                slug: 'wom-eth-sar-blouses',      parent: sub('wom-eth-sarees')._id,    level: 4, sortOrder: 2, isActive: true },
  { name: 'Petticoats',             slug: 'wom-eth-sar-petticoats',   parent: sub('wom-eth-sarees')._id,    level: 4, sortOrder: 3, isActive: true },
  { name: 'Saree With Blouse',      slug: 'wom-eth-sar-withblouse',   parent: sub('wom-eth-sarees')._id,    level: 4, sortOrder: 4, isActive: true },

  // ── Women → Ethnic Wear → Suits
  { name: 'Salwar Suits',           slug: 'wom-eth-sui-salwar',       parent: sub('wom-eth-suits')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Anarkali Suits',         slug: 'wom-eth-sui-anarkali',     parent: sub('wom-eth-suits')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Churidar Suits',         slug: 'wom-eth-sui-churidar',     parent: sub('wom-eth-suits')._id,     level: 4, sortOrder: 2, isActive: true },
  { name: 'Dress Material',         slug: 'wom-eth-sui-dressmaterial',parent: sub('wom-eth-suits')._id,     level: 4, sortOrder: 3, isActive: true },
  { name: 'Patiala Suits',          slug: 'wom-eth-sui-patiala',      parent: sub('wom-eth-suits')._id,     level: 4, sortOrder: 4, isActive: true },

  // ── Women → Ethnic Bottomwear
  { name: 'Palazzos',               slug: 'wom-eth-bot-palazzos',     parent: sub('wom-eth-bottom')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Churidars',              slug: 'wom-eth-bot-churidars',    parent: sub('wom-eth-bottom')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Patialas',               slug: 'wom-eth-bot-patialas',     parent: sub('wom-eth-bottom')._id,    level: 4, sortOrder: 2, isActive: true },
  { name: 'Sharara',                slug: 'wom-eth-bot-sharara',      parent: sub('wom-eth-bottom')._id,    level: 4, sortOrder: 3, isActive: true },
  { name: 'Salwars',                slug: 'wom-eth-bot-salwars',      parent: sub('wom-eth-bottom')._id,    level: 4, sortOrder: 4, isActive: true },

  // ── Women → Dupattas
  { name: 'Dupattas',               slug: 'wom-eth-dup-dupattas',     parent: sub('wom-eth-dupattas')._id,  level: 4, sortOrder: 0, isActive: true },
  { name: 'Stoles',                 slug: 'wom-eth-dup-stoles',       parent: sub('wom-eth-dupattas')._id,  level: 4, sortOrder: 1, isActive: true },
  { name: 'Shawls',                 slug: 'wom-eth-dup-shawls',       parent: sub('wom-eth-dupattas')._id,  level: 4, sortOrder: 2, isActive: true },
  { name: 'Pashminas',              slug: 'wom-eth-dup-pashminas',    parent: sub('wom-eth-dupattas')._id,  level: 4, sortOrder: 3, isActive: true },

  // ── Women → Ethnic Jackets
  { name: 'Koti & Jackets',         slug: 'wom-eth-jac-koti',         parent: sub('wom-eth-jackets')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Nehru Jackets',          slug: 'wom-eth-jac-nehru',        parent: sub('wom-eth-jackets')._id,   level: 4, sortOrder: 1, isActive: true },

  // ── Women → Lehengas
  { name: 'Lehenga Cholis',         slug: 'wom-eth-leh-lehenga',      parent: sub('wom-eth-lehenga')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Bridal Lehengas',        slug: 'wom-eth-leh-bridal',       parent: sub('wom-eth-lehenga')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Skirts',                 slug: 'wom-eth-leh-skirts',       parent: sub('wom-eth-lehenga')._id,   level: 4, sortOrder: 2, isActive: true },
  { name: 'Chaniya Cholis',         slug: 'wom-eth-leh-chaniya',      parent: sub('wom-eth-lehenga')._id,   level: 4, sortOrder: 3, isActive: true },

  // ── Women → Western → Tops
  { name: 'Casual Tops',            slug: 'wom-wes-top-casual',       parent: sub('wom-wes-tops')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Crop Tops',              slug: 'wom-wes-top-crop',         parent: sub('wom-wes-tops')._id,      level: 4, sortOrder: 1, isActive: true },
  { name: 'Tank Tops',              slug: 'wom-wes-top-tank',         parent: sub('wom-wes-tops')._id,      level: 4, sortOrder: 2, isActive: true },
  { name: 'T-Shirts',               slug: 'wom-wes-top-tshirts',      parent: sub('wom-wes-tops')._id,      level: 4, sortOrder: 3, isActive: true },
  { name: 'Printed Tops',           slug: 'wom-wes-top-printed',      parent: sub('wom-wes-tops')._id,      level: 4, sortOrder: 4, isActive: true },

  // ── Women → Western → Shirts
  { name: 'Casual Shirts',          slug: 'wom-wes-shi-casual',       parent: sub('wom-wes-shirts')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Formal Shirts',          slug: 'wom-wes-shi-formal',       parent: sub('wom-wes-shirts')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Tunics',                 slug: 'wom-wes-shi-tunics',       parent: sub('wom-wes-shirts')._id,    level: 4, sortOrder: 2, isActive: true },

  // ── Women → Western → Dresses
  { name: 'Casual Dresses',         slug: 'wom-wes-dre-casual',       parent: sub('wom-wes-dresses')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Party Dresses',          slug: 'wom-wes-dre-party',        parent: sub('wom-wes-dresses')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Maxi Dresses',           slug: 'wom-wes-dre-maxi',         parent: sub('wom-wes-dresses')._id,   level: 4, sortOrder: 2, isActive: true },
  { name: 'Mini Dresses',           slug: 'wom-wes-dre-mini',         parent: sub('wom-wes-dresses')._id,   level: 4, sortOrder: 3, isActive: true },
  { name: 'Gowns',                  slug: 'wom-wes-dre-gowns',        parent: sub('wom-wes-dresses')._id,   level: 4, sortOrder: 4, isActive: true },
  { name: 'Wrap Dresses',           slug: 'wom-wes-dre-wrap',         parent: sub('wom-wes-dresses')._id,   level: 4, sortOrder: 5, isActive: true },

  // ── Women → Western → Jeans
  { name: 'Slim Fit Jeans',         slug: 'wom-wes-jea-slim',         parent: sub('wom-wes-jeans')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Straight Jeans',         slug: 'wom-wes-jea-straight',     parent: sub('wom-wes-jeans')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Jeggings',               slug: 'wom-wes-jea-jeggings',     parent: sub('wom-wes-jeans')._id,     level: 4, sortOrder: 2, isActive: true },
  { name: 'Flared Jeans',           slug: 'wom-wes-jea-flared',       parent: sub('wom-wes-jeans')._id,     level: 4, sortOrder: 3, isActive: true },

  // ── Women → Western → Trousers
  { name: 'Formal Trousers',        slug: 'wom-wes-tro-formal',       parent: sub('wom-wes-trousers')._id,  level: 4, sortOrder: 0, isActive: true },
  { name: 'Palazzos',               slug: 'wom-wes-tro-palazzos',     parent: sub('wom-wes-trousers')._id,  level: 4, sortOrder: 1, isActive: true },
  { name: 'Harem Pants',            slug: 'wom-wes-tro-harem',        parent: sub('wom-wes-trousers')._id,  level: 4, sortOrder: 2, isActive: true },
  { name: 'Wide Leg Pants',         slug: 'wom-wes-tro-wide',         parent: sub('wom-wes-trousers')._id,  level: 4, sortOrder: 3, isActive: true },

  // ── Women → Western → Shorts & Skirts
  { name: 'Casual Shorts',          slug: 'wom-wes-sho-casual',       parent: sub('wom-wes-shorts')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Denim Shorts',           slug: 'wom-wes-sho-denim',        parent: sub('wom-wes-shorts')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Mini Skirts',            slug: 'wom-wes-sho-mini',         parent: sub('wom-wes-shorts')._id,    level: 4, sortOrder: 2, isActive: true },
  { name: 'Midi Skirts',            slug: 'wom-wes-sho-midi',         parent: sub('wom-wes-shorts')._id,    level: 4, sortOrder: 3, isActive: true },

  // ── Women → Western → Jackets, Hoodies, Co-ords, Blazers
  { name: 'Denim Jackets',          slug: 'wom-wes-jac-denim',        parent: sub('wom-wes-jackets')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Leather Jackets',        slug: 'wom-wes-jac-leather',      parent: sub('wom-wes-jackets')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Puffer Jackets',         slug: 'wom-wes-jac-puffer',       parent: sub('wom-wes-jackets')._id,   level: 4, sortOrder: 2, isActive: true },
  { name: 'Sweatshirts',            slug: 'wom-wes-hoo-sweat',        parent: sub('wom-wes-hoodies')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Hoodies',                slug: 'wom-wes-hoo-hoodie',       parent: sub('wom-wes-hoodies')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Top & Bottom Sets',      slug: 'wom-wes-coo-sets',         parent: sub('wom-wes-coords')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Matching Sets',          slug: 'wom-wes-coo-matching',     parent: sub('wom-wes-coords')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Blazers',                slug: 'wom-wes-bla-blazers',      parent: sub('wom-wes-blazers')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Formal Blazers',         slug: 'wom-wes-bla-formal',       parent: sub('wom-wes-blazers')._id,   level: 4, sortOrder: 1, isActive: true },

  // ── Women → Shoes
  { name: 'Stilettos',              slug: 'wom-sho-hee-stilettos',    parent: sub('wom-sho-heels')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Block Heels',            slug: 'wom-sho-hee-block',        parent: sub('wom-sho-heels')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Wedges',                 slug: 'wom-sho-hee-wedges',       parent: sub('wom-sho-heels')._id,     level: 4, sortOrder: 2, isActive: true },
  { name: 'Ballerinas',             slug: 'wom-sho-fla-ballerinas',   parent: sub('wom-sho-flats')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Loafers',                slug: 'wom-sho-fla-loafers',      parent: sub('wom-sho-flats')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Slip-Ons',               slug: 'wom-sho-fla-slipon',       parent: sub('wom-sho-flats')._id,     level: 4, sortOrder: 2, isActive: true },
  { name: 'Flat Sandals',           slug: 'wom-sho-san-flat',         parent: sub('wom-sho-sandals')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Heeled Sandals',         slug: 'wom-sho-san-heeled',       parent: sub('wom-sho-sandals')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Running Shoes',          slug: 'wom-sho-spt-running',      parent: sub('wom-sho-sports')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Sports Sneakers',        slug: 'wom-sho-spt-sneakers',     parent: sub('wom-sho-sports')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Ankle Boots',            slug: 'wom-sho-boo-ankle',        parent: sub('wom-sho-boots')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Knee-High Boots',        slug: 'wom-sho-boo-knee',         parent: sub('wom-sho-boots')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Juttis & Mojaris',       slug: 'wom-sho-eth-juttis',       parent: sub('wom-sho-ethnic')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Kolhapuris',             slug: 'wom-sho-eth-kolhapuri',    parent: sub('wom-sho-ethnic')._id,    level: 4, sortOrder: 1, isActive: true },
  { name: 'Ethnic Heels',           slug: 'wom-sho-eth-heels',        parent: sub('wom-sho-ethnic')._id,    level: 4, sortOrder: 2, isActive: true },

  // ── Women → Watches
  { name: 'Analog Watches',         slug: 'wom-wat-ana-watches',      parent: sub('wom-wat-analog')._id,    level: 4, sortOrder: 0, isActive: true },
  { name: 'Smart Watches',          slug: 'wom-wat-smt-watches',      parent: sub('wom-wat-smart')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Fashion Watches',        slug: 'wom-wat-fas-watches',      parent: sub('wom-wat-fashion')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Bangle Watches',         slug: 'wom-wat-fas-bangle',       parent: sub('wom-wat-fashion')._id,   level: 4, sortOrder: 1, isActive: true },

  // ── Women → Accessories
  { name: 'Handbags',               slug: 'wom-acc-bag-handbags',     parent: sub('wom-acc-bags')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Clutches',               slug: 'wom-acc-bag-clutches',     parent: sub('wom-acc-bags')._id,      level: 4, sortOrder: 1, isActive: true },
  { name: 'Tote Bags',              slug: 'wom-acc-bag-tote',         parent: sub('wom-acc-bags')._id,      level: 4, sortOrder: 2, isActive: true },
  { name: 'Backpacks',              slug: 'wom-acc-bag-backpacks',    parent: sub('wom-acc-bags')._id,      level: 4, sortOrder: 3, isActive: true },
  { name: 'Sunglasses',             slug: 'wom-acc-sun-glasses',      parent: sub('wom-acc-sunglasses')._id,level: 4, sortOrder: 0, isActive: true },
  { name: 'Scarves',                slug: 'wom-acc-sca-scarves',      parent: sub('wom-acc-scarves')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Stoles',                 slug: 'wom-acc-sca-stoles',       parent: sub('wom-acc-scarves')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Formal Belts',           slug: 'wom-acc-bel-formal',       parent: sub('wom-acc-belts')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Casual Belts',           slug: 'wom-acc-bel-casual',       parent: sub('wom-acc-belts')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Hair Clips & Pins',      slug: 'wom-acc-hai-clips',        parent: sub('wom-acc-hair')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Headbands',              slug: 'wom-acc-hai-headbands',    parent: sub('wom-acc-hair')._id,      level: 4, sortOrder: 1, isActive: true },
  { name: 'Scrunchies',             slug: 'wom-acc-hai-scrunchies',   parent: sub('wom-acc-hair')._id,      level: 4, sortOrder: 2, isActive: true },

  // ── Women → Jewellery
  { name: 'Gold Necklaces',         slug: 'wom-jwl-nec-gold',         parent: sub('wom-jwl-necklaces')._id, level: 4, sortOrder: 0, isActive: true },
  { name: 'Silver Necklaces',       slug: 'wom-jwl-nec-silver',       parent: sub('wom-jwl-necklaces')._id, level: 4, sortOrder: 1, isActive: true },
  { name: 'Chokers',                slug: 'wom-jwl-nec-chokers',      parent: sub('wom-jwl-necklaces')._id, level: 4, sortOrder: 2, isActive: true },
  { name: 'Pendant Necklaces',      slug: 'wom-jwl-nec-pendant',      parent: sub('wom-jwl-necklaces')._id, level: 4, sortOrder: 3, isActive: true },
  { name: 'Stud Earrings',          slug: 'wom-jwl-ear-studs',        parent: sub('wom-jwl-earrings')._id,  level: 4, sortOrder: 0, isActive: true },
  { name: 'Drop Earrings',          slug: 'wom-jwl-ear-drop',         parent: sub('wom-jwl-earrings')._id,  level: 4, sortOrder: 1, isActive: true },
  { name: 'Jhumkas',                slug: 'wom-jwl-ear-jhumkas',      parent: sub('wom-jwl-earrings')._id,  level: 4, sortOrder: 2, isActive: true },
  { name: 'Hoop Earrings',          slug: 'wom-jwl-ear-hoops',        parent: sub('wom-jwl-earrings')._id,  level: 4, sortOrder: 3, isActive: true },
  { name: 'Bangles',                slug: 'wom-jwl-ban-bangles',      parent: sub('wom-jwl-bangles')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Bracelets',              slug: 'wom-jwl-ban-bracelets',    parent: sub('wom-jwl-bangles')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Kadas',                  slug: 'wom-jwl-ban-kadas',        parent: sub('wom-jwl-bangles')._id,   level: 4, sortOrder: 2, isActive: true },
  { name: 'Gold Rings',             slug: 'wom-jwl-rin-gold',         parent: sub('wom-jwl-rings')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Silver Rings',           slug: 'wom-jwl-rin-silver',       parent: sub('wom-jwl-rings')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Anklets',                slug: 'wom-jwl-ank-anklets',      parent: sub('wom-jwl-anklets')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Nose Pins',              slug: 'wom-jwl-nos-nosepins',     parent: sub('wom-jwl-nosepins')._id,  level: 4, sortOrder: 0, isActive: true },
  { name: 'Nose Rings',             slug: 'wom-jwl-nos-noserings',    parent: sub('wom-jwl-nosepins')._id,  level: 4, sortOrder: 1, isActive: true },
  { name: 'Maang Tikka',            slug: 'wom-jwl-maa-maangtikka',   parent: sub('wom-jwl-maangtikka')._id,level: 4, sortOrder: 0, isActive: true },
  { name: 'Pendants',               slug: 'wom-jwl-pen-pendants',     parent: sub('wom-jwl-pendants')._id,  level: 4, sortOrder: 0, isActive: true },
  { name: 'Mangalsutra',            slug: 'wom-jwl-man-mangalsutra',  parent: sub('wom-jwl-mangalsutra')._id,level:4, sortOrder: 0, isActive: true },
  { name: 'Jewellery Sets',         slug: 'wom-jwl-set-sets',         parent: sub('wom-jwl-sets')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Bridal Sets',            slug: 'wom-jwl-set-bridal',       parent: sub('wom-jwl-sets')._id,      level: 4, sortOrder: 1, isActive: true },

  // ── Women → Sports
  { name: 'Sports Tops',            slug: 'wom-spt-top-tops',         parent: sub('wom-spt-tops')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Sports T-Shirts',        slug: 'wom-spt-top-tshirts',      parent: sub('wom-spt-tops')._id,      level: 4, sortOrder: 1, isActive: true },
  { name: 'Sports Bras',            slug: 'wom-spt-bra-sports',       parent: sub('wom-spt-bras')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Yoga Leggings',          slug: 'wom-spt-leg-yoga',         parent: sub('wom-spt-leggings')._id,  level: 4, sortOrder: 0, isActive: true },
  { name: 'Compression Tights',     slug: 'wom-spt-leg-compression',  parent: sub('wom-spt-leggings')._id,  level: 4, sortOrder: 1, isActive: true },
  { name: 'Track Pants',            slug: 'wom-spt-tra-track',        parent: sub('wom-spt-tracksuits')._id,level: 4, sortOrder: 0, isActive: true },
  { name: 'Tracksuit Sets',         slug: 'wom-spt-tra-sets',         parent: sub('wom-spt-tracksuits')._id,level: 4, sortOrder: 1, isActive: true },

  // ── Women → Nightwear
  { name: 'Pyjama Sets',            slug: 'wom-nit-sui-pyjama',       parent: sub('wom-nit-suits')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Shirt & Pyjama Sets',    slug: 'wom-nit-sui-shirt',        parent: sub('wom-nit-suits')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Nightgowns',             slug: 'wom-nit-gow-gowns',        parent: sub('wom-nit-gowns')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Robes',                  slug: 'wom-nit-gow-robes',        parent: sub('wom-nit-gowns')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Shorts Sets',            slug: 'wom-nit-sho-shorts',       parent: sub('wom-nit-shorts')._id,    level: 4, sortOrder: 0, isActive: true },

  // ── Women → Innerwear
  { name: 'T-Shirt Bras',           slug: 'wom-inn-bra-tshirt',       parent: sub('wom-inn-bras')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Sports Bras',            slug: 'wom-inn-bra-sports',       parent: sub('wom-inn-bras')._id,      level: 4, sortOrder: 1, isActive: true },
  { name: 'Padded Bras',            slug: 'wom-inn-bra-padded',       parent: sub('wom-inn-bras')._id,      level: 4, sortOrder: 2, isActive: true },
  { name: 'Panties',                slug: 'wom-inn-pan-panties',      parent: sub('wom-inn-panties')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Briefs',                 slug: 'wom-inn-pan-briefs',       parent: sub('wom-inn-panties')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Shapewear',              slug: 'wom-inn-sha-shapewear',    parent: sub('wom-inn-shapewear')._id, level: 4, sortOrder: 0, isActive: true },
  { name: 'Camisoles',              slug: 'wom-inn-cam-camisoles',    parent: sub('wom-inn-camisoles')._id, level: 4, sortOrder: 0, isActive: true },
  { name: 'Slips',                  slug: 'wom-inn-cam-slips',        parent: sub('wom-inn-camisoles')._id, level: 4, sortOrder: 1, isActive: true },
  { name: 'Socks',                  slug: 'wom-inn-soc-socks',        parent: sub('wom-inn-socks')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Stockings',              slug: 'wom-inn-soc-stockings',    parent: sub('wom-inn-socks')._id,     level: 4, sortOrder: 1, isActive: true },

  // ── Kids → Boys Clothing
  { name: 'T-Shirts',               slug: 'kid-boy-tshirts',          parent: sub('kid-clo-boys')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Shirts',                 slug: 'kid-boy-shirts',           parent: sub('kid-clo-boys')._id,      level: 4, sortOrder: 1, isActive: true },
  { name: 'Jeans & Trousers',       slug: 'kid-boy-jeans',            parent: sub('kid-clo-boys')._id,      level: 4, sortOrder: 2, isActive: true },
  { name: 'Shorts',                 slug: 'kid-boy-shorts',           parent: sub('kid-clo-boys')._id,      level: 4, sortOrder: 3, isActive: true },
  { name: 'Ethnic Wear',            slug: 'kid-boy-ethnic',           parent: sub('kid-clo-boys')._id,      level: 4, sortOrder: 4, isActive: true },
  { name: 'Sets',                   slug: 'kid-boy-sets',             parent: sub('kid-clo-boys')._id,      level: 4, sortOrder: 5, isActive: true },

  // ── Kids → Girls Clothing
  { name: 'Frocks & Dresses',       slug: 'kid-grl-frocks',           parent: sub('kid-clo-girls')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Tops',                   slug: 'kid-grl-tops',             parent: sub('kid-clo-girls')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Leggings & Jeans',       slug: 'kid-grl-leggings',         parent: sub('kid-clo-girls')._id,     level: 4, sortOrder: 2, isActive: true },
  { name: 'Ethnic Wear',            slug: 'kid-grl-ethnic',           parent: sub('kid-clo-girls')._id,     level: 4, sortOrder: 3, isActive: true },
  { name: 'Sets',                   slug: 'kid-grl-sets',             parent: sub('kid-clo-girls')._id,     level: 4, sortOrder: 4, isActive: true },

  // ── Kids → Baby Clothing
  { name: 'Bodysuits',              slug: 'kid-bab-bodysuits',        parent: sub('kid-clo-baby')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Rompers',                slug: 'kid-bab-rompers',          parent: sub('kid-clo-baby')._id,      level: 4, sortOrder: 1, isActive: true },
  { name: 'Clothing Sets',          slug: 'kid-bab-sets',             parent: sub('kid-clo-baby')._id,      level: 4, sortOrder: 2, isActive: true },
  { name: 'Sleepsuits',             slug: 'kid-bab-sleepsuits',       parent: sub('kid-clo-baby')._id,      level: 4, sortOrder: 3, isActive: true },

  // ── Kids → Party Wear
  { name: 'Boys Party Wear',        slug: 'kid-par-boys',             parent: sub('kid-clo-party')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Girls Party Wear',       slug: 'kid-par-girls',            parent: sub('kid-clo-party')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'Ethnic Party Sets',      slug: 'kid-par-ethnic',           parent: sub('kid-clo-party')._id,     level: 4, sortOrder: 2, isActive: true },

  // ── Kids → Innerwear
  { name: 'Briefs & Vests',         slug: 'kid-boi-briefs',           parent: sub('kid-clo-boysinn')._id,   level: 4, sortOrder: 0, isActive: true },
  { name: 'Socks',                  slug: 'kid-boi-socks',            parent: sub('kid-clo-boysinn')._id,   level: 4, sortOrder: 1, isActive: true },
  { name: 'Panties',                slug: 'kid-gri-panties',          parent: sub('kid-clo-girlsinn')._id,  level: 4, sortOrder: 0, isActive: true },
  { name: 'Socks',                  slug: 'kid-gri-socks',            parent: sub('kid-clo-girlsinn')._id,  level: 4, sortOrder: 1, isActive: true },

  // ── Kids → Shoes
  { name: 'Sneakers',               slug: 'kid-bsh-sneakers',         parent: sub('kid-sho-boys')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Sandals',                slug: 'kid-bsh-sandals',          parent: sub('kid-sho-boys')._id,      level: 4, sortOrder: 1, isActive: true },
  { name: 'School Shoes',           slug: 'kid-bsh-school',           parent: sub('kid-sho-boys')._id,      level: 4, sortOrder: 2, isActive: true },
  { name: 'Sneakers',               slug: 'kid-gsh-sneakers',         parent: sub('kid-sho-girls')._id,     level: 4, sortOrder: 0, isActive: true },
  { name: 'Sandals & Flats',        slug: 'kid-gsh-sandals',          parent: sub('kid-sho-girls')._id,     level: 4, sortOrder: 1, isActive: true },
  { name: 'School Shoes',           slug: 'kid-gsh-school',           parent: sub('kid-sho-girls')._id,     level: 4, sortOrder: 2, isActive: true },
  { name: 'Baby Booties',           slug: 'kid-bash-booties',         parent: sub('kid-sho-baby')._id,      level: 4, sortOrder: 0, isActive: true },
  { name: 'Baby Sandals',           slug: 'kid-bash-sandals',         parent: sub('kid-sho-baby')._id,      level: 4, sortOrder: 1, isActive: true },
])
console.log('✅  Level 4 — Item Names inserted')

// ══════════════════════════════════════════════════════════════
// SIZES
// ══════════════════════════════════════════════════════════════
const ALPHA      = ['XS','S','M','L','XL','XXL','3XL']
const ALPHA_PLUS = ['XS','S','M','L','XL','XXL','3XL','4XL']
const WAIST_M    = ['28','30','32','34','36','38','40','42']
const WAIST_W    = ['24','26','28','30','32','34','36']
const SHOE_M     = ['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11','UK 12']
const SHOE_W     = ['UK 3','UK 4','UK 5','UK 6','UK 7','UK 8']
const SHOE_K     = ['1C','2C','3C','4C','5C','6C','7C','8C','9C','10C','11C','12C','1','2','3']
const FREE       = ['Free Size']
const WATCH_ACC  = ['Free Size']
const JEWEL_RING = ['6','7','8','9','10','11','12','Free Size']
const BRA_SIZES  = ['28A','28B','28C','28D','30A','30B','30C','30D','32A','32B','32C','32D','34A','34B','34C','34D','36A','36B','36C','36D','38A','38B','38C','38D','40B','40C','40D']
const KIDS_SIZES = ['1Y','2Y','3Y','4Y','5Y','6Y','7Y','8Y','10Y','12Y','14Y']
const BABY_SIZES = ['0-3M','3-6M','6-9M','6-12M','12-18M','18-24M']

const sizeDocs = []
const addSizes = (arr, catId, typeId, subTypeId, nameId) => {
  arr.forEach((sv, idx) => sizeDocs.push({
    sizeValue: sv, categoryId: catId, itemTypeId: typeId,
    subItemTypeId: subTypeId, itemNameId: nameId, sortOrder: idx, isActive: true,
  }))
}

const namesBySubSlug = (subSlug) => itemNames.filter(n => n.parent?.toString() === sub(subSlug)._id?.toString())

// Men Ethnic
namesBySubSlug('men-eth-kurtas').forEach(n => addSizes(ALPHA, men._id, menEthnic._id, sub('men-eth-kurtas')._id, n._id))
namesBySubSlug('men-eth-sherwani').forEach(n => addSizes(ALPHA, men._id, menEthnic._id, sub('men-eth-sherwani')._id, n._id))
namesBySubSlug('men-eth-sets').forEach(n => addSizes(ALPHA, men._id, menEthnic._id, sub('men-eth-sets')._id, n._id))
namesBySubSlug('men-eth-dhotis').forEach(n => addSizes(FREE, men._id, menEthnic._id, sub('men-eth-dhotis')._id, n._id))
namesBySubSlug('men-eth-nehru').forEach(n => addSizes(ALPHA, men._id, menEthnic._id, sub('men-eth-nehru')._id, n._id))
namesBySubSlug('men-eth-pathani').forEach(n => addSizes(ALPHA, men._id, menEthnic._id, sub('men-eth-pathani')._id, n._id))

// Men Western
namesBySubSlug('men-wes-tshirts').forEach(n => addSizes(ALPHA, men._id, menWestern._id, sub('men-wes-tshirts')._id, n._id))
namesBySubSlug('men-wes-casual').forEach(n => addSizes(ALPHA, men._id, menWestern._id, sub('men-wes-casual')._id, n._id))
namesBySubSlug('men-wes-formal').forEach(n => addSizes(ALPHA, men._id, menWestern._id, sub('men-wes-formal')._id, n._id))
namesBySubSlug('men-wes-jeans').forEach(n => addSizes(WAIST_M, men._id, menWestern._id, sub('men-wes-jeans')._id, n._id))
namesBySubSlug('men-wes-shorts').forEach(n => addSizes(WAIST_M, men._id, menWestern._id, sub('men-wes-shorts')._id, n._id))
namesBySubSlug('men-wes-jackets').forEach(n => addSizes(ALPHA, men._id, menWestern._id, sub('men-wes-jackets')._id, n._id))
namesBySubSlug('men-wes-hoodies').forEach(n => addSizes(ALPHA, men._id, menWestern._id, sub('men-wes-hoodies')._id, n._id))
namesBySubSlug('men-wes-blazers').forEach(n => addSizes(ALPHA, men._id, menWestern._id, sub('men-wes-blazers')._id, n._id))

// Men Shoes
namesBySubSlug('men-sho-casual').forEach(n => addSizes(SHOE_M, men._id, menShoes._id, sub('men-sho-casual')._id, n._id))
namesBySubSlug('men-sho-formal').forEach(n => addSizes(SHOE_M, men._id, menShoes._id, sub('men-sho-formal')._id, n._id))
namesBySubSlug('men-sho-sports').forEach(n => addSizes(SHOE_M, men._id, menShoes._id, sub('men-sho-sports')._id, n._id))
namesBySubSlug('men-sho-sandals').forEach(n => addSizes(SHOE_M, men._id, menShoes._id, sub('men-sho-sandals')._id, n._id))
namesBySubSlug('men-sho-boots').forEach(n => addSizes(SHOE_M, men._id, menShoes._id, sub('men-sho-boots')._id, n._id))

// Men Watches / Accessories / Jewellery
namesBySubSlug('men-wat-analog').forEach(n => addSizes(WATCH_ACC, men._id, menWatches._id, sub('men-wat-analog')._id, n._id))
namesBySubSlug('men-wat-digital').forEach(n => addSizes(WATCH_ACC, men._id, menWatches._id, sub('men-wat-digital')._id, n._id))
namesBySubSlug('men-wat-smart').forEach(n => addSizes(WATCH_ACC, men._id, menWatches._id, sub('men-wat-smart')._id, n._id))
namesBySubSlug('men-wat-luxury').forEach(n => addSizes(WATCH_ACC, men._id, menWatches._id, sub('men-wat-luxury')._id, n._id))
namesBySubSlug('men-acc-bags').forEach(n => addSizes(FREE, men._id, menAccessories._id, sub('men-acc-bags')._id, n._id))
namesBySubSlug('men-acc-belts').forEach(n => addSizes(FREE, men._id, menAccessories._id, sub('men-acc-belts')._id, n._id))
namesBySubSlug('men-acc-wallets').forEach(n => addSizes(FREE, men._id, menAccessories._id, sub('men-acc-wallets')._id, n._id))
namesBySubSlug('men-acc-sunglasses').forEach(n => addSizes(FREE, men._id, menAccessories._id, sub('men-acc-sunglasses')._id, n._id))
namesBySubSlug('men-acc-caps').forEach(n => addSizes(FREE, men._id, menAccessories._id, sub('men-acc-caps')._id, n._id))
namesBySubSlug('men-jwl-rings').forEach(n => addSizes(JEWEL_RING, men._id, menJewellery._id, sub('men-jwl-rings')._id, n._id))
namesBySubSlug('men-jwl-chains').forEach(n => addSizes(FREE, men._id, menJewellery._id, sub('men-jwl-chains')._id, n._id))
namesBySubSlug('men-jwl-bracelets').forEach(n => addSizes(FREE, men._id, menJewellery._id, sub('men-jwl-bracelets')._id, n._id))

// Men Sports / Innerwear
namesBySubSlug('men-spt-tshirts').forEach(n => addSizes(ALPHA, men._id, menSports._id, sub('men-spt-tshirts')._id, n._id))
namesBySubSlug('men-spt-tracksuits').forEach(n => addSizes(ALPHA, men._id, menSports._id, sub('men-spt-tracksuits')._id, n._id))
namesBySubSlug('men-spt-gym').forEach(n => addSizes(ALPHA, men._id, menSports._id, sub('men-spt-gym')._id, n._id))
namesBySubSlug('men-inn-briefs').forEach(n => addSizes(ALPHA, men._id, menInnerwear._id, sub('men-inn-briefs')._id, n._id))
namesBySubSlug('men-inn-vests').forEach(n => addSizes(ALPHA, men._id, menInnerwear._id, sub('men-inn-vests')._id, n._id))
namesBySubSlug('men-inn-socks').forEach(n => addSizes(FREE, men._id, menInnerwear._id, sub('men-inn-socks')._id, n._id))

// Women Ethnic
namesBySubSlug('wom-eth-kurtis').forEach(n => addSizes(ALPHA_PLUS, women._id, womenEthnic._id, sub('wom-eth-kurtis')._id, n._id))
namesBySubSlug('wom-eth-sarees').forEach(n => addSizes(FREE, women._id, womenEthnic._id, sub('wom-eth-sarees')._id, n._id))
namesBySubSlug('wom-eth-suits').forEach(n => addSizes(ALPHA_PLUS, women._id, womenEthnic._id, sub('wom-eth-suits')._id, n._id))
namesBySubSlug('wom-eth-bottom').forEach(n => addSizes(ALPHA_PLUS, women._id, womenEthnic._id, sub('wom-eth-bottom')._id, n._id))
namesBySubSlug('wom-eth-dupattas').forEach(n => addSizes(FREE, women._id, womenEthnic._id, sub('wom-eth-dupattas')._id, n._id))
namesBySubSlug('wom-eth-jackets').forEach(n => addSizes(ALPHA_PLUS, women._id, womenEthnic._id, sub('wom-eth-jackets')._id, n._id))
namesBySubSlug('wom-eth-lehenga').forEach(n => addSizes(ALPHA_PLUS, women._id, womenEthnic._id, sub('wom-eth-lehenga')._id, n._id))

// Women Western
namesBySubSlug('wom-wes-tops').forEach(n => addSizes(ALPHA_PLUS, women._id, womenWestern._id, sub('wom-wes-tops')._id, n._id))
namesBySubSlug('wom-wes-shirts').forEach(n => addSizes(ALPHA_PLUS, women._id, womenWestern._id, sub('wom-wes-shirts')._id, n._id))
namesBySubSlug('wom-wes-dresses').forEach(n => addSizes(ALPHA_PLUS, women._id, womenWestern._id, sub('wom-wes-dresses')._id, n._id))
namesBySubSlug('wom-wes-jeans').forEach(n => addSizes(WAIST_W, women._id, womenWestern._id, sub('wom-wes-jeans')._id, n._id))
namesBySubSlug('wom-wes-trousers').forEach(n => addSizes(ALPHA_PLUS, women._id, womenWestern._id, sub('wom-wes-trousers')._id, n._id))
namesBySubSlug('wom-wes-shorts').forEach(n => addSizes(ALPHA_PLUS, women._id, womenWestern._id, sub('wom-wes-shorts')._id, n._id))
namesBySubSlug('wom-wes-jackets').forEach(n => addSizes(ALPHA_PLUS, women._id, womenWestern._id, sub('wom-wes-jackets')._id, n._id))
namesBySubSlug('wom-wes-hoodies').forEach(n => addSizes(ALPHA_PLUS, women._id, womenWestern._id, sub('wom-wes-hoodies')._id, n._id))
namesBySubSlug('wom-wes-coords').forEach(n => addSizes(ALPHA_PLUS, women._id, womenWestern._id, sub('wom-wes-coords')._id, n._id))
namesBySubSlug('wom-wes-blazers').forEach(n => addSizes(ALPHA_PLUS, women._id, womenWestern._id, sub('wom-wes-blazers')._id, n._id))

// Women Shoes
namesBySubSlug('wom-sho-heels').forEach(n => addSizes(SHOE_W, women._id, womenShoes._id, sub('wom-sho-heels')._id, n._id))
namesBySubSlug('wom-sho-flats').forEach(n => addSizes(SHOE_W, women._id, womenShoes._id, sub('wom-sho-flats')._id, n._id))
namesBySubSlug('wom-sho-sandals').forEach(n => addSizes(SHOE_W, women._id, womenShoes._id, sub('wom-sho-sandals')._id, n._id))
namesBySubSlug('wom-sho-sports').forEach(n => addSizes(SHOE_W, women._id, womenShoes._id, sub('wom-sho-sports')._id, n._id))
namesBySubSlug('wom-sho-boots').forEach(n => addSizes(SHOE_W, women._id, womenShoes._id, sub('wom-sho-boots')._id, n._id))
namesBySubSlug('wom-sho-ethnic').forEach(n => addSizes(SHOE_W, women._id, womenShoes._id, sub('wom-sho-ethnic')._id, n._id))

// Women Watches / Accessories / Jewellery
namesBySubSlug('wom-wat-analog').forEach(n => addSizes(WATCH_ACC, women._id, womenWatches._id, sub('wom-wat-analog')._id, n._id))
namesBySubSlug('wom-wat-smart').forEach(n => addSizes(WATCH_ACC, women._id, womenWatches._id, sub('wom-wat-smart')._id, n._id))
namesBySubSlug('wom-wat-fashion').forEach(n => addSizes(WATCH_ACC, women._id, womenWatches._id, sub('wom-wat-fashion')._id, n._id))
namesBySubSlug('wom-acc-bags').forEach(n => addSizes(FREE, women._id, womenAccessories._id, sub('wom-acc-bags')._id, n._id))
namesBySubSlug('wom-acc-sunglasses').forEach(n => addSizes(FREE, women._id, womenAccessories._id, sub('wom-acc-sunglasses')._id, n._id))
namesBySubSlug('wom-acc-scarves').forEach(n => addSizes(FREE, women._id, womenAccessories._id, sub('wom-acc-scarves')._id, n._id))
namesBySubSlug('wom-acc-belts').forEach(n => addSizes(FREE, women._id, womenAccessories._id, sub('wom-acc-belts')._id, n._id))
namesBySubSlug('wom-acc-hair').forEach(n => addSizes(FREE, women._id, womenAccessories._id, sub('wom-acc-hair')._id, n._id))
namesBySubSlug('wom-jwl-necklaces').forEach(n => addSizes(FREE, women._id, womenJewellery._id, sub('wom-jwl-necklaces')._id, n._id))
namesBySubSlug('wom-jwl-earrings').forEach(n => addSizes(FREE, women._id, womenJewellery._id, sub('wom-jwl-earrings')._id, n._id))
namesBySubSlug('wom-jwl-bangles').forEach(n => addSizes(FREE, women._id, womenJewellery._id, sub('wom-jwl-bangles')._id, n._id))
namesBySubSlug('wom-jwl-rings').forEach(n => addSizes(JEWEL_RING, women._id, womenJewellery._id, sub('wom-jwl-rings')._id, n._id))
namesBySubSlug('wom-jwl-anklets').forEach(n => addSizes(FREE, women._id, womenJewellery._id, sub('wom-jwl-anklets')._id, n._id))
namesBySubSlug('wom-jwl-nosepins').forEach(n => addSizes(FREE, women._id, womenJewellery._id, sub('wom-jwl-nosepins')._id, n._id))
namesBySubSlug('wom-jwl-maangtikka').forEach(n => addSizes(FREE, women._id, womenJewellery._id, sub('wom-jwl-maangtikka')._id, n._id))
namesBySubSlug('wom-jwl-pendants').forEach(n => addSizes(FREE, women._id, womenJewellery._id, sub('wom-jwl-pendants')._id, n._id))
namesBySubSlug('wom-jwl-mangalsutra').forEach(n => addSizes(FREE, women._id, womenJewellery._id, sub('wom-jwl-mangalsutra')._id, n._id))
namesBySubSlug('wom-jwl-sets').forEach(n => addSizes(FREE, women._id, womenJewellery._id, sub('wom-jwl-sets')._id, n._id))

// Women Sports / Nightwear / Innerwear
namesBySubSlug('wom-spt-tops').forEach(n => addSizes(ALPHA_PLUS, women._id, womenSports._id, sub('wom-spt-tops')._id, n._id))
namesBySubSlug('wom-spt-bras').forEach(n => addSizes(BRA_SIZES, women._id, womenSports._id, sub('wom-spt-bras')._id, n._id))
namesBySubSlug('wom-spt-leggings').forEach(n => addSizes(ALPHA_PLUS, women._id, womenSports._id, sub('wom-spt-leggings')._id, n._id))
namesBySubSlug('wom-spt-tracksuits').forEach(n => addSizes(ALPHA_PLUS, women._id, womenSports._id, sub('wom-spt-tracksuits')._id, n._id))
namesBySubSlug('wom-nit-suits').forEach(n => addSizes(ALPHA_PLUS, women._id, womenNightwear._id, sub('wom-nit-suits')._id, n._id))
namesBySubSlug('wom-nit-gowns').forEach(n => addSizes(ALPHA_PLUS, women._id, womenNightwear._id, sub('wom-nit-gowns')._id, n._id))
namesBySubSlug('wom-nit-shorts').forEach(n => addSizes(ALPHA_PLUS, women._id, womenNightwear._id, sub('wom-nit-shorts')._id, n._id))
namesBySubSlug('wom-inn-bras').forEach(n => addSizes(BRA_SIZES, women._id, womenInnerwear._id, sub('wom-inn-bras')._id, n._id))
namesBySubSlug('wom-inn-panties').forEach(n => addSizes(ALPHA_PLUS, women._id, womenInnerwear._id, sub('wom-inn-panties')._id, n._id))
namesBySubSlug('wom-inn-shapewear').forEach(n => addSizes(ALPHA_PLUS, women._id, womenInnerwear._id, sub('wom-inn-shapewear')._id, n._id))
namesBySubSlug('wom-inn-camisoles').forEach(n => addSizes(ALPHA_PLUS, women._id, womenInnerwear._id, sub('wom-inn-camisoles')._id, n._id))
namesBySubSlug('wom-inn-socks').forEach(n => addSizes(FREE, women._id, womenInnerwear._id, sub('wom-inn-socks')._id, n._id))

// Kids
namesBySubSlug('kid-clo-boys').forEach(n => addSizes(KIDS_SIZES, kids._id, kidsClothing._id, sub('kid-clo-boys')._id, n._id))
namesBySubSlug('kid-clo-girls').forEach(n => addSizes(KIDS_SIZES, kids._id, kidsClothing._id, sub('kid-clo-girls')._id, n._id))
namesBySubSlug('kid-clo-baby').forEach(n => addSizes(BABY_SIZES, kids._id, kidsClothing._id, sub('kid-clo-baby')._id, n._id))
namesBySubSlug('kid-clo-party').forEach(n => addSizes(KIDS_SIZES, kids._id, kidsClothing._id, sub('kid-clo-party')._id, n._id))
namesBySubSlug('kid-clo-boysinn').forEach(n => addSizes(KIDS_SIZES, kids._id, kidsClothing._id, sub('kid-clo-boysinn')._id, n._id))
namesBySubSlug('kid-clo-girlsinn').forEach(n => addSizes(KIDS_SIZES, kids._id, kidsClothing._id, sub('kid-clo-girlsinn')._id, n._id))
namesBySubSlug('kid-sho-boys').forEach(n => addSizes(SHOE_K, kids._id, kidsShoes._id, sub('kid-sho-boys')._id, n._id))
namesBySubSlug('kid-sho-girls').forEach(n => addSizes(SHOE_K, kids._id, kidsShoes._id, sub('kid-sho-girls')._id, n._id))
namesBySubSlug('kid-sho-baby').forEach(n => addSizes(SHOE_K, kids._id, kidsShoes._id, sub('kid-sho-baby')._id, n._id))

await Size.insertMany(sizeDocs)
console.log(`✅  ${sizeDocs.length} sizes inserted`)

// ══════════════════════════════════════════════════════════════
// COLORS
// ══════════════════════════════════════════════════════════════
const clothingColors = [
  'Black','White','Grey','Charcoal','Off White','Cream','Beige',
  'Navy Blue','Royal Blue','Sky Blue','Light Blue','Teal','Turquoise',
  'Red','Maroon','Burgundy','Brick Red','Coral','Peach',
  'Pink','Hot Pink','Baby Pink','Magenta','Rose',
  'Yellow','Mustard','Golden Yellow','Lemon Yellow',
  'Orange','Rust','Burnt Orange',
  'Green','Olive','Bottle Green','Mint Green','Sage','Forest Green','Lime Green',
  'Purple','Lavender','Violet','Indigo','Lilac',
  'Brown','Tan','Camel','Chocolate','Khaki',
  'Tie-Dye','Printed','Striped','Checked','Other',
]
const shoesColors = [
  'Black','White','Brown','Tan','Beige','Camel','Chocolate',
  'Navy Blue','Royal Blue','Grey','Charcoal',
  'Red','Maroon','Burgundy','Green','Olive','Khaki','Orange','Yellow','Other',
]
const watchColors = [
  'Black Dial','White Dial','Silver Dial','Blue Dial','Grey Dial',
  'Gold Dial','Rose Gold Dial','Champagne Dial','Brown Dial',
  'Black Strap','Brown Strap','Blue Strap','Silver Bracelet',
  'Gold Bracelet','Rose Gold Bracelet','Mesh Band','Rubber Band','Other',
]
const jewelleryColors = [
  '22K Gold','18K Gold','14K Gold','Gold Plated',
  '925 Sterling Silver','Silver Plated','Rose Gold','Rose Gold Plated',
  'White Gold','Rhodium Plated','Antique Gold','Antique Silver',
  'Two-Tone (Gold & Silver)','Platinum','Oxidised Silver','Copper','Other',
]
const accessoriesColors = [
  'Black','Brown','Tan','Navy Blue','Grey','White','Beige',
  'Olive','Khaki','Maroon','Burgundy',
  'Red','Blue','Green','Yellow','Orange','Pink','Purple',
  'Camouflage','Printed','Transparent / Clear','Other',
]

const colorDocs = []
const addColors = (arr, catId, typeId) => {
  arr.forEach((cn, idx) => colorDocs.push({ colorName: cn, categoryId: catId, itemTypeId: typeId, sortOrder: idx, isActive: true }))
}
addColors(clothingColors,    men._id,   menEthnic._id)
addColors(clothingColors,    men._id,   menWestern._id)
addColors(shoesColors,       men._id,   menShoes._id)
addColors(watchColors,       men._id,   menWatches._id)
addColors(accessoriesColors, men._id,   menAccessories._id)
addColors(jewelleryColors,   men._id,   menJewellery._id)
addColors(clothingColors,    men._id,   menSports._id)
addColors(clothingColors,    men._id,   menInnerwear._id)
addColors(clothingColors,    women._id, womenEthnic._id)
addColors(clothingColors,    women._id, womenWestern._id)
addColors(shoesColors,       women._id, womenShoes._id)
addColors(watchColors,       women._id, womenWatches._id)
addColors(accessoriesColors, women._id, womenAccessories._id)
addColors(jewelleryColors,   women._id, womenJewellery._id)
addColors(clothingColors,    women._id, womenSports._id)
addColors(clothingColors,    women._id, womenNightwear._id)
addColors(clothingColors,    women._id, womenInnerwear._id)
addColors(clothingColors,    kids._id,  kidsClothing._id)
addColors(shoesColors,       kids._id,  kidsShoes._id)

await Color.insertMany(colorDocs)
console.log(`✅  ${colorDocs.length} colors inserted`)

// ══════════════════════════════════════════════════════════════
// ADDITIONAL DETAILS
// ══════════════════════════════════════════════════════════════
const MATERIAL   = ['Cotton','Polyester','Linen','Silk','Wool','Rayon','Nylon','Denim','Georgette','Chiffon','Velvet','Fleece','Blended','Other']
const SLEEVE     = ['Full Sleeve','Half Sleeve','3/4 Sleeve','Sleeveless','Cap Sleeve','Roll-Up Sleeve']
const PATTERN    = ['Solid','Striped','Checked','Printed','Embroidered','Tie-Dye','Abstract','Floral','Geometric','Plain']
const STYLE      = ['Casual','Formal','Party Wear','Ethnic','Sports','Workwear','Lounge Wear','Other']
const CARE       = ['Machine Wash','Hand Wash Only','Dry Clean Only','Do Not Bleach','Tumble Dry Low']
const ORIGIN     = ['India','China','Bangladesh','Vietnam','Turkey','Other']
const NECK       = ['Round Neck','V-Neck','Collar','Polo','Hooded','U-Neck','Square Neck','Turtle Neck','Boat Neck','Henley']
const FIT        = ['Regular Fit','Slim Fit','Oversized','Relaxed Fit','Tailored Fit','Loose Fit','Body Fit','Straight Fit']
const LENGTH     = ['Crop','Short','Regular','Midi','Maxi','Full Length','Knee Length','Ankle Length']
const WATCH_MAT  = ['Stainless Steel','Leather','Silicone','Rubber','Titanium','Ceramic','Nylon','Plastic','Gold Plated','Other']
const WATCH_GLASS= ['Mineral Glass','Sapphire Crystal','Hardlex Glass','Acrylic Glass']
const WATCH_MOV  = ['Quartz','Automatic','Manual Wind','Solar','Kinetic','Smart / Digital']
const WATER_RES  = ['Not Water Resistant','3 ATM (Splash Proof)','5 ATM (Swimming)','10 ATM (Diving)']
const JWEL_MAT   = ['Gold','Silver','925 Sterling Silver','Rose Gold','Platinum','Brass','Copper','Alloy','Stainless Steel','Other']
const JWEL_PLATE = ['22K Gold Plated','18K Gold Plated','Rose Gold Plated','Rhodium Plated','Silver Plated','No Plating']
const GEMSTONE   = ['No Gemstone','Diamond','Ruby','Emerald','Sapphire','Pearl','Cubic Zirconia','Turquoise','Onyx','Amethyst','Other']
const JWEL_OCC   = ['Casual','Formal','Wedding','Festival','Party','Daily Wear','Bridal','Gift']
const SHOE_MAT   = ['Leather','Synthetic','Mesh','Canvas','Suede','Rubber','PU','Textile','Other']
const SOLE       = ['Rubber','EVA','PU Foam','Leather','Synthetic','Crepe','Cork']
const SHOE_CLOSE = ['Lace-Up','Slip-On','Velcro','Buckle','Zipper','Hook & Loop']
const SHOE_OCC   = ['Casual','Formal','Sports / Running','Party','Outdoor','Beach / Pool','Office','Wedding']
const OCCASION   = ['Casual','Formal','Party','Wedding','Festival','Sports','Travel','Daily Wear','Office Wear']

await AdditionalDetail.insertMany([
  { categoryId: men._id,   itemTypeId: menEthnic._id,      isActive: true, fields: [{name:'materialComposition',label:'Material Composition',type:'select',options:MATERIAL,sortOrder:0},{name:'sleeveType',label:'Sleeve Type',type:'select',options:SLEEVE,sortOrder:1},{name:'pattern',label:'Pattern',type:'select',options:PATTERN,sortOrder:2},{name:'style',label:'Style',type:'select',options:STYLE,sortOrder:3},{name:'careInstructions',label:'Care Instructions',type:'select',options:CARE,sortOrder:4},{name:'countryOfOrigin',label:'Country of Origin',type:'select',options:ORIGIN,sortOrder:5}] },
  { categoryId: men._id,   itemTypeId: menWestern._id,     isActive: true, fields: [{name:'materialComposition',label:'Material Composition',type:'select',options:MATERIAL,sortOrder:0},{name:'sleeveType',label:'Sleeve Type',type:'select',options:SLEEVE,sortOrder:1},{name:'length',label:'Length',type:'select',options:LENGTH,sortOrder:2},{name:'neckStyle',label:'Neck Style',type:'select',options:NECK,sortOrder:3},{name:'pattern',label:'Pattern',type:'select',options:PATTERN,sortOrder:4},{name:'fitType',label:'Fit Type',type:'select',options:FIT,sortOrder:5},{name:'style',label:'Style',type:'select',options:STYLE,sortOrder:6},{name:'careInstructions',label:'Care Instructions',type:'select',options:CARE,sortOrder:7},{name:'countryOfOrigin',label:'Country of Origin',type:'select',options:ORIGIN,sortOrder:8}] },
  { categoryId: men._id,   itemTypeId: menShoes._id,       isActive: true, fields: [{name:'materialComposition',label:'Upper Material',type:'select',options:SHOE_MAT,sortOrder:0},{name:'soleType',label:'Sole Type',type:'select',options:SOLE,sortOrder:1},{name:'closureType',label:'Closure Type',type:'select',options:SHOE_CLOSE,sortOrder:2},{name:'occasionType',label:'Occasion Type',type:'select',options:SHOE_OCC,sortOrder:3},{name:'countryOfOrigin',label:'Country of Origin',type:'select',options:ORIGIN,sortOrder:4}] },
  { categoryId: men._id,   itemTypeId: menWatches._id,     isActive: true, fields: [{name:'materialType',label:'Strap / Case Material',type:'select',options:WATCH_MAT,sortOrder:0},{name:'watchGlass',label:'Watch Glass Type',type:'select',options:WATCH_GLASS,sortOrder:1},{name:'movement',label:'Movement / Display',type:'select',options:WATCH_MOV,sortOrder:2},{name:'waterResistance',label:'Water Resistance',type:'select',options:WATER_RES,sortOrder:3},{name:'occasionType',label:'Occasion Type',type:'select',options:OCCASION,sortOrder:4}] },
  { categoryId: men._id,   itemTypeId: menJewellery._id,   isActive: true, fields: [{name:'materialComposition',label:'Material / Metal',type:'select',options:JWEL_MAT,sortOrder:0},{name:'plating',label:'Plating',type:'select',options:JWEL_PLATE,sortOrder:1},{name:'gemstone',label:'Gemstone / Stone',type:'select',options:GEMSTONE,sortOrder:2},{name:'occasionType',label:'Occasion Type',type:'select',options:JWEL_OCC,sortOrder:3},{name:'countryOfOrigin',label:'Country of Origin',type:'select',options:ORIGIN,sortOrder:4}] },
  { categoryId: women._id, itemTypeId: womenEthnic._id,    isActive: true, fields: [{name:'materialComposition',label:'Material Composition',type:'select',options:MATERIAL,sortOrder:0},{name:'sleeveType',label:'Sleeve Type',type:'select',options:SLEEVE,sortOrder:1},{name:'length',label:'Length',type:'select',options:LENGTH,sortOrder:2},{name:'neckStyle',label:'Neck Style',type:'select',options:NECK,sortOrder:3},{name:'pattern',label:'Pattern',type:'select',options:PATTERN,sortOrder:4},{name:'fitType',label:'Fit Type',type:'select',options:FIT,sortOrder:5},{name:'style',label:'Style',type:'select',options:STYLE,sortOrder:6},{name:'careInstructions',label:'Care Instructions',type:'select',options:CARE,sortOrder:7},{name:'countryOfOrigin',label:'Country of Origin',type:'select',options:ORIGIN,sortOrder:8}] },
  { categoryId: women._id, itemTypeId: womenWestern._id,   isActive: true, fields: [{name:'materialComposition',label:'Material Composition',type:'select',options:MATERIAL,sortOrder:0},{name:'sleeveType',label:'Sleeve Type',type:'select',options:SLEEVE,sortOrder:1},{name:'length',label:'Length',type:'select',options:LENGTH,sortOrder:2},{name:'neckStyle',label:'Neck Style',type:'select',options:NECK,sortOrder:3},{name:'pattern',label:'Pattern',type:'select',options:PATTERN,sortOrder:4},{name:'fitType',label:'Fit Type',type:'select',options:FIT,sortOrder:5},{name:'style',label:'Style',type:'select',options:STYLE,sortOrder:6},{name:'careInstructions',label:'Care Instructions',type:'select',options:CARE,sortOrder:7},{name:'countryOfOrigin',label:'Country of Origin',type:'select',options:ORIGIN,sortOrder:8}] },
  { categoryId: women._id, itemTypeId: womenShoes._id,     isActive: true, fields: [{name:'materialComposition',label:'Upper Material',type:'select',options:SHOE_MAT,sortOrder:0},{name:'soleType',label:'Sole Type',type:'select',options:SOLE,sortOrder:1},{name:'closureType',label:'Closure Type',type:'select',options:SHOE_CLOSE,sortOrder:2},{name:'occasionType',label:'Occasion Type',type:'select',options:SHOE_OCC,sortOrder:3},{name:'countryOfOrigin',label:'Country of Origin',type:'select',options:ORIGIN,sortOrder:4}] },
  { categoryId: women._id, itemTypeId: womenJewellery._id, isActive: true, fields: [{name:'materialComposition',label:'Material / Metal',type:'select',options:JWEL_MAT,sortOrder:0},{name:'plating',label:'Plating',type:'select',options:JWEL_PLATE,sortOrder:1},{name:'gemstone',label:'Gemstone / Stone',type:'select',options:GEMSTONE,sortOrder:2},{name:'occasionType',label:'Occasion Type',type:'select',options:JWEL_OCC,sortOrder:3},{name:'countryOfOrigin',label:'Country of Origin',type:'select',options:ORIGIN,sortOrder:4}] },
  { categoryId: kids._id,  itemTypeId: kidsClothing._id,   isActive: true, fields: [{name:'materialComposition',label:'Material Composition',type:'select',options:MATERIAL,sortOrder:0},{name:'sleeveType',label:'Sleeve Type',type:'select',options:SLEEVE,sortOrder:1},{name:'pattern',label:'Pattern',type:'select',options:PATTERN,sortOrder:2},{name:'style',label:'Style',type:'select',options:STYLE,sortOrder:3},{name:'careInstructions',label:'Care Instructions',type:'select',options:CARE,sortOrder:4},{name:'countryOfOrigin',label:'Country of Origin',type:'select',options:ORIGIN,sortOrder:5}] },
])
console.log('✅  Additional details inserted')

// ── Summary ────────────────────────────────────────────────────
console.log('\n🎉  Seeding complete!\n')
const total = await Category.countDocuments()
console.log(`   Level 1 Categories : 3`)
console.log(`   Level 2 Item Types  : 19`)
console.log(`   Level 3 Sub Types   : ${subItemTypes.length}`)
console.log(`   Level 4 Item Names  : ${itemNames.length}`)
console.log(`   Total Categories    : ${total}`)
console.log(`   Sizes               : ${await Size.countDocuments()}`)
console.log(`   Colors              : ${await Color.countDocuments()}`)
console.log(`   Additional Details  : ${await AdditionalDetail.countDocuments()}`)
console.log('')

await mongoose.disconnect()
process.exit(0)