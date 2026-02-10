export const mockAdAccounts = [
  {
    id: '1',
    platform: 'meta',
    accountName: 'Fashion Brand Studio',
    accountTitle: 'Ad Account 123456789',
    avatarUrl: 'https://ui-avatars.com/api/?name=Fashion+Brand&background=1877f2&color=fff&size=200',
    status: 'active',
    connectedAt: '2024-01-15',
  },
  {
    id: '2',
    platform: 'tiktok',
    accountName: 'TechStore Official',
    accountTitle: 'Ad Account 987654321',
    avatarUrl: 'https://ui-avatars.com/api/?name=TechStore&background=000000&color=00f2ea&size=200',
    status: 'active',
    connectedAt: '2024-02-20',
  },
  {
    id: '3',
    platform: 'meta',
    accountName: 'Beauty & Cosmetics',
    accountTitle: 'Ad Account 456789123',
    avatarUrl: 'https://ui-avatars.com/api/?name=Beauty+Cosmetics&background=1877f2&color=fff&size=200',
    status: 'active',
    connectedAt: '2024-03-10',
  },
];

export const platforms = [
  {
    id: 'meta',
    name: 'Meta',
    fullName: 'Meta Business Suite',
    description: 'Facebook & Instagram Ads',
    color: '#1877F2',
    icon: 'meta',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    fullName: 'TikTok Ads Manager',
    description: 'TikTok For Business',
    color: '#000000',
    accentColor: '#00F2EA',
    icon: 'tiktok',
  },
];

export const mockAccountSelectionData = {
  meta: [
    {
      id: 'meta_acc_1',
      name: 'Fashion Brand Studio',
      accountId: '123456789',
      businessName: 'My Fashion Business',
    },
    {
      id: 'meta_acc_2',
      name: 'Boutique Elegance',
      accountId: '987654321',
      businessName: 'Elegance Group',
    },
  ],
  tiktok: [
    {
      id: 'tiktok_acc_1',
      name: 'TechStore Official',
      accountId: '987654321',
      businessName: 'Tech Solutions Inc',
    },
    {
      id: 'tiktok_acc_2',
      name: 'Gadget Hub',
      accountId: '456123789',
      businessName: 'Gadget Hub LLC',
    },
  ],
};
