const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const variations = [
  'c0q6ukcia00p',
  'c0g6ukcia00p',
  'c0q6uhcia00p',
  'c0g6uhcia00p',
  'c0q6ukcia00q',
  'c0g6ukcia00q',
  'c0q6uhcia00q',
  'c0g6uhcia00q',
  'c0q6ukc1a00p',
  'c0g6ukc1a00p',
  'c0q6uhc1a00p',
  'c0g6uhc1a00p',
  'c0q6ukcla00p',
  'c0g6ukcla00p',
  'c0q6uhcla00p',
  'c0g6uhcla00p',
  'c0q6ukcia00p',
  'c0q6ukc1a00p',
  'c0q6ukcia00p',
  'c0q6ukcia00p'
];

// Generate dynamic variations for c0q6ukcia00p
const p1s = ['c0q6', 'c0g6', 'c0q6', 'c0g6'];
const p2s = ['u', 'v'];
const p3s = ['k', 'h', 'x'];
const p4s = ['c', 'o', '0'];
const p5s = ['i', 'l', '1', 'j'];
const p6s = ['a', 'o', '0'];
const p7s = ['00p', '00q', 'oqp', 'oqq', '00p'];

const domains = new Set();
for (const p1 of p1s) {
  for (const p2 of p2s) {
    for (const p3 of p3s) {
      for (const p4 of p4s) {
        for (const p5 of p5s) {
          for (const p6 of p6s) {
            for (const p7 of p7s) {
              domains.add(`aether-plant-db.${p1}${p2}${p3}${p4}${p5}${p6}${p7}.ap-southeast-1.rds.amazonaws.com`);
            }
          }
        }
      }
    }
  }
}

// Add simple variations too
for (const v of variations) {
  domains.add(`aether-plant-db.${v}.ap-southeast-1.rds.amazonaws.com`);
}

const list = Array.from(domains);
console.log(`Testing ${list.length} focused variations...`);

let found = false;
const promises = list.map(domain => {
  return new Promise((resolve) => {
    dns.resolve4(domain, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        console.log(`\n\n🎉 FOUND IT!!!`);
        console.log(`Domain: ${domain}`);
        console.log(`IP: ${addresses[0]}`);
        found = true;
      }
      resolve();
    });
  });
});

Promise.all(promises).then(() => {
  if (!found) {
    console.log('\n❌ No working domain found in variations.');
  }
});
