import 'package:flutter/material.dart';
import 'package:islamic_app/features/home/domain/home_feature.dart';

abstract final class HomeFeatureCatalog {
  static const features = <HomeFeature>[
    HomeFeature(routeName: 'prayer-times', path: '/prayer-times', title: 'Prayer Times', description: 'Daily salah schedule', icon: Icons.schedule_rounded, tint: Color(0xFF147D64)),
    HomeFeature(routeName: 'qibla', path: '/qibla', title: 'Qibla', description: 'Find the direction of Makkah', icon: Icons.explore_rounded, tint: Color(0xFFB7791F)),
    HomeFeature(routeName: 'quran', path: '/quran', title: 'Quran', description: 'Read and continue offline', icon: Icons.menu_book_rounded, tint: Color(0xFF4267A9)),
    HomeFeature(routeName: 'daily-verse', path: '/daily-verse', title: 'Daily Verse', description: 'A moment of reflection', icon: Icons.auto_awesome_rounded, tint: Color(0xFF8E5AA7)),
    HomeFeature(routeName: 'tasbeeh', path: '/tasbeeh', title: 'Tasbeeh', description: 'A focused dhikr counter', icon: Icons.touch_app_rounded, tint: Color(0xFF2A7A88)),
    HomeFeature(routeName: 'dhikr', path: '/dhikr', title: 'Dhikr Library', description: 'Authentic daily remembrances', icon: Icons.favorite_rounded, tint: Color(0xFFB6535A)),
    HomeFeature(routeName: 'reminders', path: '/reminders', title: 'Reminders', description: 'Gentle, timely notifications', icon: Icons.notifications_active_rounded, tint: Color(0xFFC26B35)),
    HomeFeature(routeName: 'calendar', path: '/calendar', title: 'Islamic Calendar', description: 'Hijri dates and occasions', icon: Icons.calendar_month_rounded, tint: Color(0xFF567A3A)),
    HomeFeature(routeName: 'mosques', path: '/mosques', title: 'Mosque Finder', description: 'Discover nearby mosques', icon: Icons.location_on_rounded, tint: Color(0xFF3F6E8C)),
    HomeFeature(routeName: 'devices', path: '/devices', title: 'Smart Devices', description: 'Connect a watch or tasbeeh', icon: Icons.bluetooth_rounded, tint: Color(0xFF4A5FB5)),
    HomeFeature(routeName: 'profile', path: '/profile', title: 'Profile & Sync', description: 'Your settings across devices', icon: Icons.person_rounded, tint: Color(0xFF70665B)),
  ];
}
