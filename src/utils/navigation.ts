export function findDrawer(navigation: any): any {
  let n = navigation;
  while (n) {
    if (typeof n.openDrawer === 'function') return n;
    n = n.getParent?.();
  }
  return null;
}

export function openAppDrawer(navigation: any) {
  findDrawer(navigation)?.openDrawer?.();
}

export function goToCart(navigation: any) {
  let n = navigation;
  while (n) {
    const state = n.getState?.();
    if (state?.routeNames?.includes('CartTab')) {
      n.navigate('CartTab');
      return;
    }
    if (state?.routeNames?.includes('MainTabs')) {
      n.navigate('MainTabs', { screen: 'CartTab' });
      return;
    }
    if (state?.routeNames?.includes('Main')) {
      n.navigate('Main', {
        screen: 'MainTabs',
        params: { screen: 'CartTab' },
      });
      return;
    }
    n = n.getParent?.();
  }
}

export function goToWishlist(navigation: any) {
  let n = navigation;
  while (n) {
    const state = n.getState?.();
    if (state?.routeNames?.includes('MainTabs')) {
      n.navigate('MainTabs', {
        screen: 'ProfileTab',
        params: { screen: 'Wishlist' },
      });
      return;
    }
    if (state?.routeNames?.includes('Main')) {
      n.navigate('Main', {
        screen: 'MainTabs',
        params: {
          screen: 'ProfileTab',
          params: { screen: 'Wishlist' },
        },
      });
      return;
    }
    if (state?.routeNames?.includes('WishlistDrawer')) {
      n.navigate('WishlistDrawer');
      return;
    }
    if (state?.routeNames?.includes('Wishlist')) {
      n.navigate('Wishlist');
      return;
    }
    n = n.getParent?.();
  }
}

export function goToSearch(navigation: any) {
  let n = navigation;
  while (n) {
    const state = n.getState?.();
    if (state?.routeNames?.includes('Search')) {
      n.navigate('Search');
      return;
    }
    n = n.getParent?.();
  }
}
