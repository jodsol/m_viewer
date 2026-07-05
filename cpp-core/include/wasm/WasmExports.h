#pragma once

extern "C" {
int analyze_stl(const unsigned char* data, int size);

int get_triangle_count();
int get_vertex_count();

double get_bounds_min_x();
double get_bounds_min_y();
double get_bounds_min_z();

double get_bounds_max_x();
double get_bounds_max_y();
double get_bounds_max_z();

const char* get_last_error();
}
