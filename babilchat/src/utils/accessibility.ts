import { getCurrentLocale, isRTLLocale } from './i18n';

// Accessibility roles for different components
export const AccessibilityRoles = {
  button: 'button',
  link: 'link',
  text: 'text',
  heading: 'header',
  image: 'image',
  imageButton: 'imagebutton',
  tab: 'tab',
  tabList: 'tablist',
  menu: 'menu',
  menuItem: 'menuitem',
  search: 'search',
  textInput: 'textfield',
  adjustable: 'adjustable',
  summary: 'summary',
  none: 'none',
} as const;

// Accessibility states
export const AccessibilityStates = {
  selected: 'selected',
  checked: 'checked',
  unchecked: 'unchecked',
  disabled: 'disabled',
  expanded: 'expanded',
  collapsed: 'collapsed',
  busy: 'busy',
} as const;

// Common accessibility labels and hints in multiple languages
export const AccessibilityLabels = {
  tr: {
    // Navigation
    homeTab: 'Ana Sayfa sekmesi',
    chatTab: 'Sohbet sekmesi',
    prayerWallTab: 'Dua Duvarı sekmesi',
    studyTab: 'Çalışma sekmesi',
    profileTab: 'Profil sekmesi',
    backButton: 'Geri',
    closeButton: 'Kapat',
    menuButton: 'Menü',
    
    // Actions
    share: 'Paylaş',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Düzenle',
    search: 'Ara',
    filter: 'Filtrele',
    refresh: 'Yenile',
    
    // Content
    loading: 'Yükleniyor',
    error: 'Hata',
    success: 'Başarılı',
    retry: 'Tekrar dene',
    
    // Prayer specific
    prayFor: 'Dua et',
    addPrayer: 'Dua ekle',
    prayerTime: 'Namaz vakti',
    
    // Hints
    buttonHint: 'Dokunmak için çift tıklayın',
    textFieldHint: 'Metin girmek için çift tıklayın',
    linkHint: 'Açmak için çift tıklayın',
  },
  en: {
    // Navigation
    homeTab: 'Home tab',
    chatTab: 'Chat tab',
    prayerWallTab: 'Prayer Wall tab',
    studyTab: 'Study tab',
    profileTab: 'Profile tab',
    backButton: 'Back',
    closeButton: 'Close',
    menuButton: 'Menu',
    
    // Actions
    share: 'Share',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    refresh: 'Refresh',
    
    // Content
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    retry: 'Retry',
    
    // Prayer specific
    prayFor: 'Pray',
    addPrayer: 'Add prayer',
    prayerTime: 'Prayer time',
    
    // Hints
    buttonHint: 'Double tap to activate',
    textFieldHint: 'Double tap to edit',
    linkHint: 'Double tap to open',
  },
  ar: {
    // Navigation
    homeTab: 'تبويب الرئيسية',
    chatTab: 'تبويب المحادثة',
    prayerWallTab: 'تبويب جدار الدعاء',
    studyTab: 'تبويب الدراسة',
    profileTab: 'تبويب الملف الشخصي',
    backButton: 'رجوع',
    closeButton: 'إغلاق',
    menuButton: 'القائمة',
    
    // Actions
    share: 'مشاركة',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    search: 'بحث',
    filter: 'تصفية',
    refresh: 'تحديث',
    
    // Content
    loading: 'جاري التحميل',
    error: 'خطأ',
    success: 'نجح',
    retry: 'إعادة المحاولة',
    
    // Prayer specific
    prayFor: 'ادع',
    addPrayer: 'إضافة دعاء',
    prayerTime: 'وقت الصلاة',
    
    // Hints
    buttonHint: 'اضغط مرتين للتفعيل',
    textFieldHint: 'اضغط مرتين للتعديل',
    linkHint: 'اضغط مرتين للفتح',
  },
} as const;

// Get accessibility label based on current locale
export const getAccessibilityLabel = (key: keyof typeof AccessibilityLabels.tr): string => {
  const locale = getCurrentLocale() as keyof typeof AccessibilityLabels;
  return AccessibilityLabels[locale]?.[key] || AccessibilityLabels.tr[key] || key;
};

// Common accessibility props generator
export const createAccessibilityProps = (options: {
  role?: keyof typeof AccessibilityRoles;
  label?: string;
  hint?: string;
  state?: keyof typeof AccessibilityStates;
  value?: string | number;
  adjustable?: {
    increment: () => void;
    decrement: () => void;
  };
  elements?: string[];
}) => {
  const props: any = {};

  // Basic props
  if (options.role) {
    props.accessibilityRole = AccessibilityRoles[options.role];
  }

  if (options.label) {
    props.accessibilityLabel = options.label;
  }

  if (options.hint) {
    props.accessibilityHint = options.hint;
  }

  if (options.value !== undefined) {
    props.accessibilityValue = { text: String(options.value) };
  }

  // State props
  if (options.state) {
    switch (options.state) {
      case 'selected':
        props.accessibilityState = { selected: true };
        break;
      case 'checked':
        props.accessibilityState = { checked: true };
        break;
      case 'unchecked':
        props.accessibilityState = { checked: false };
        break;
      case 'disabled':
        props.accessibilityState = { disabled: true };
        break;
      case 'expanded':
        props.accessibilityState = { expanded: true };
        break;
      case 'collapsed':
        props.accessibilityState = { expanded: false };
        break;
      case 'busy':
        props.accessibilityState = { busy: true };
        break;
    }
  }

  // Adjustable props (for sliders, steppers, etc.)
  if (options.adjustable) {
    props.accessibilityActions = [
      { name: 'increment', label: 'Artır' },
      { name: 'decrement', label: 'Azalt' },
    ];
    props.onAccessibilityAction = (event: any) => {
      if (event.nativeEvent.actionName === 'increment') {
        options.adjustable!.increment();
      } else if (event.nativeEvent.actionName === 'decrement') {
        options.adjustable!.decrement();
      }
    };
  }

  return props;
};

// Navigation accessibility helpers
export const createTabAccessibilityProps = (
  tabName: string,
  isSelected: boolean,
  index: number,
  totalTabs: number
) => {
  const label = getAccessibilityLabel(tabName as keyof typeof AccessibilityLabels.tr);
  
  return createAccessibilityProps({
    role: 'tab',
    label: `${label}, ${index + 1} / ${totalTabs}`,
    state: isSelected ? 'selected' : undefined,
    hint: getAccessibilityLabel('buttonHint'),
  });
};

// Button accessibility helpers
export const createButtonAccessibilityProps = (
  labelKey: string,
  isDisabled?: boolean,
  customHint?: string
) => {
  return createAccessibilityProps({
    role: 'button',
    label: getAccessibilityLabel(labelKey as keyof typeof AccessibilityLabels.tr),
    state: isDisabled ? 'disabled' : undefined,
    hint: customHint || getAccessibilityLabel('buttonHint'),
  });
};

// Text input accessibility helpers
export const createTextInputAccessibilityProps = (
  labelKey: string,
  value?: string,
  isRequired?: boolean
) => {
  const label = getAccessibilityLabel(labelKey as keyof typeof AccessibilityLabels.tr);
  const requiredText = isRequired ? ' (Gerekli)' : '';
  
  return createAccessibilityProps({
    role: 'textInput',
    label: label + requiredText,
    value: value,
    hint: getAccessibilityLabel('textFieldHint'),
  });
};

// Prayer-specific accessibility helpers
export const createPrayerCardAccessibilityProps = (
  title: string,
  author: string,
  prayerCount: number,
  userHasPrayed: boolean
) => {
  const prayedText = userHasPrayed ? 'Dua edildi' : 'Dua edilmemiş';
  const countText = `${prayerCount} kişi dua etti`;
  
  return createAccessibilityProps({
    role: 'button',
    label: `${title}, ${author} tarafından, ${countText}, ${prayedText}`,
    hint: 'Dua etmek için çift tıklayın',
  });
};

// Loading state accessibility
export const createLoadingAccessibilityProps = () => {
  return createAccessibilityProps({
    role: 'text',
    label: getAccessibilityLabel('loading'),
    state: 'busy',
  });
};

// Error state accessibility
export const createErrorAccessibilityProps = (errorMessage?: string) => {
  const label = errorMessage || getAccessibilityLabel('error');
  
  return createAccessibilityProps({
    role: 'text',
    label: `Hata: ${label}`,
    hint: 'Tekrar denemek için çift tıklayın',
  });
};

// RTL-aware accessibility helpers
export const createRTLAccessibilityProps = (baseProps: any) => {
  const isRTL = isRTLLocale();
  
  return {
    ...baseProps,
    accessibilityLanguage: isRTL ? 'ar' : getCurrentLocale(),
  };
};

// Collection/List accessibility helpers
export const createListAccessibilityProps = (
  itemCount: number,
  currentIndex?: number
) => {
  const props: any = {
    accessibilityRole: 'list',
  };

  if (currentIndex !== undefined) {
    props.accessibilityLabel = `Liste, ${itemCount} öğe, ${currentIndex + 1}. öğe seçili`;
  } else {
    props.accessibilityLabel = `Liste, ${itemCount} öğe`;
  }

  return props;
};

// Heading accessibility helpers
export const createHeadingAccessibilityProps = (
  text: string,
  level: 1 | 2 | 3 | 4 | 5 | 6 = 1
) => {
  return createAccessibilityProps({
    role: 'heading',
    label: text,
  });
};

export default {
  AccessibilityRoles,
  AccessibilityStates,
  AccessibilityLabels,
  getAccessibilityLabel,
  createAccessibilityProps,
  createTabAccessibilityProps,
  createButtonAccessibilityProps,
  createTextInputAccessibilityProps,
  createPrayerCardAccessibilityProps,
  createLoadingAccessibilityProps,
  createErrorAccessibilityProps,
  createRTLAccessibilityProps,
  createListAccessibilityProps,
  createHeadingAccessibilityProps,
}; 