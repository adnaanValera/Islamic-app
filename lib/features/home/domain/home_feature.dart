import 'package:flutter/material.dart';

@immutable
class HomeFeature {
  const HomeFeature({
    required this.routeName,
    required this.path,
    required this.title,
    required this.description,
    required this.icon,
    required this.tint,
  });

  final String routeName;
  final String path;
  final String title;
  final String description;
  final IconData icon;
  final Color tint;
}
