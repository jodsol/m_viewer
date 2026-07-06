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

int raycast_last_mesh(
    double origin_x,
    double origin_y,
    double origin_z,
    double direction_x,
    double direction_y,
    double direction_z
);

int get_raycast_hit();
int get_raycast_triangle_index();
double get_raycast_distance();
double get_raycast_position_x();
double get_raycast_position_y();
double get_raycast_position_z();

const char* get_last_error();
}
