import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const AuctivaApp());
}

class AuctivaApp extends StatelessWidget {
  const AuctivaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Auctiva',
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF1B4D3E),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
