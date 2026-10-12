import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Use 10.0.2.2 instead of localhost when running on the Android emulator.
  static const String baseUrl = 'http://localhost:8080';

  static Future<String> getStatus() async {
    final res = await http.get(Uri.parse('$baseUrl/api/status'));
    if (res.statusCode != 200) {
      throw Exception('Status check failed: ${res.statusCode}');
    }
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return body['status'] as String;
  }
}
