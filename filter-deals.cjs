const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace('<OffersPage />', '<OffersPage userRole={userRole} />');
fs.writeFileSync('src/App.tsx', appContent);

let offersContent = fs.readFileSync('src/pages/OffersPage.tsx', 'utf8');
offersContent = offersContent.replace('export default function OffersPage() {', 'export default function OffersPage({ userRole }: { userRole?: string }) {');

const filterLogic = `
  const roleCategoryMap: any = {
    'hotel': ['hotel', 'resort'],
    'safari': ['safari'],
    'restaurant': ['restaurant', 'dining', 'food'],
    'museum': ['museum', 'historical'],
    'event': ['event', 'festival', 'show', 'party'],
    'tour': ['tour', 'cruise', 'diving', 'nile cruise'],
  };

  const visibleDeals = userRole === 'superadmin' || !userRole 
    ? deals 
    : deals.filter(deal => {
        const keywords = roleCategoryMap[userRole] || [userRole];
        const cat = (deal.category || '').toLowerCase();
        return keywords.some((k) => cat.includes(k));
      });
`;

offersContent = offersContent.replace('const [deals, setOffers] = useState<any[]>([]);', 'const [deals, setOffers] = useState<any[]>([]);' + filterLogic);
offersContent = offersContent.replace(/deals\.map/g, 'visibleDeals.map');
offersContent = offersContent.replace(/deals\.length === 0/g, 'visibleDeals.length === 0');

fs.writeFileSync('src/pages/OffersPage.tsx', offersContent);
