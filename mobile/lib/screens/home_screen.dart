import 'package:flutter/material.dart';
import '../services/api_service.dart';

/// Placeholder home screen. Real screens (splash, onboarding, listings,
/// auctions, trade-in, etc.) come from the screen list in the master
/// spec section 29, built in the order set out in /docs/ROADMAP.md.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _status = 'checking backend...';

  @override
  void initState() {
    super.initState();
    ApiService.getStatus().then((status) {
      setState(() => _status = status);
    }).catchError((_) {
      setState(() => _status = 'backend unreachable');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Auctiva')),
      body: Center(
        child: Text('Scaffold running — $_status'),
      ),
    );
  }
}
